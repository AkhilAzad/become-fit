const IS_LOCAL = window.location.origin.includes("localhost");

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getApiBaseCandidates() {
  const runtimeBase = normalizeBaseUrl(window.BECOME_FIT_API_BASE);
  const storedBase = normalizeBaseUrl(window.localStorage?.getItem("becomefit_api_base"));

  const defaults = IS_LOCAL
    ? ["http://localhost:3000"]
    : [`${window.location.origin}/api`, window.location.origin];

  return [...new Set([runtimeBase, storedBase, ...defaults].filter(Boolean))];
}

const API_BASE_CANDIDATES = getApiBaseCandidates();

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    const error = new Error("Unexpected response from payment server");
    error.responseText = text;
    throw error;
  }

  return response.json();
}

async function postJsonWithFallback(path, payload) {
  let lastError;
  let lastFailedResponse;

  for (const baseUrl of API_BASE_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        const errorText = String(data?.error || "").toLowerCase();
        const shouldRetryOnThisBase =
          response.status === 401 ||
          response.status === 403 ||
          response.status === 404 ||
          errorText.includes("authentication failed") ||
          errorText.includes("unauthorized");

        lastFailedResponse = { response, data };

        if (shouldRetryOnThisBase) {
          continue;
        }
      }

      return { response, data };
    } catch (err) {
      lastError = err;
    }
  }

  if (lastFailedResponse) {
    return lastFailedResponse;
  }

  if (lastError?.responseText?.includes("The page could not be found")) {
    throw new Error("Payment API endpoint not found. Please redeploy the backend routes.");
  }

  throw new Error("Unable to reach payment service. Please try again.");
}

async function startPayment(amount, plan) {
  try {
    const { response: orderResponse, data } = await postJsonWithFallback("/create-order", {
      amount,
      plan,
    });

    if (!orderResponse.ok) {
      throw new Error(data.error || "Order creation failed");
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "Become Fit",
      description: plan,
      order_id: data.orderId,
      handler: async function (response) {
        try {
          const { response: verifyResponse, data: result } = await postJsonWithFallback(
            "/verify-payment",
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            }
          );

          if (!verifyResponse.ok || !result.success) {
            throw new Error(result.error || "Payment verification failed");
          }

          document.body.innerHTML =
            "<h2 style='text-align:center;margin-top:100px;'>Payment Successful. Preparing your download...</h2>";

          setTimeout(() => {
            window.location.href = `${window.location.origin}${result.download}`;
          }, 1500);
        } catch (err) {
          console.error(err);
          alert(err.message || "Something went wrong during verification.");
        }
      },
      modal: {
        ondismiss: function () {
          console.log("Payment popup closed");
        },
      },
      theme: {
        color: "#00ff88",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    alert(err.message || "Order creation failed.");
  }
}
