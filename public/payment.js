const API_BASE_URL = window.location.origin.includes("localhost")
  ? "http://localhost:3000"
  : window.location.origin;

async function startPayment(amount, plan) {
  try {
    const orderResponse = await fetch(`${API_BASE_URL}/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, plan }),
    });

    const data = await orderResponse.json();

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
          const verifyResponse = await fetch(`${API_BASE_URL}/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            }),
          });

          const result = await verifyResponse.json();

          if (!verifyResponse.ok || !result.success) {
            throw new Error(result.error || "Payment verification failed");
          }

          document.body.innerHTML =
            "<h2 style='text-align:center;margin-top:100px;'>Payment Successful. Preparing your download...</h2>";

          setTimeout(() => {
            window.location.href = `${API_BASE_URL}${result.download}`;
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
