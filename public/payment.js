function startPayment(amount, plan) {

  fetch("https://become-fit-backend.onrender.com/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amount,
      plan: plan
    })
  })
    .then(res => res.json())
    .then(data => {

      var options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Become Fit",
        description: plan,
        order_id: data.orderId,

        handler: function (response) {

          fetch("https://become-fit-backend.onrender.com/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan
            })
          })
            .then(res => res.json())
            .then(result => {

              if (result.success) {

                document.body.innerHTML =
                  "<h2 style='text-align:center;margin-top:100px;'>Payment Successful. Preparing your download...</h2>";

                setTimeout(() => {
                  window.location.href = "https://become-fit-backend.onrender.com" + result.download;
                }, 1500);

              } else {
                alert("Payment verification failed");
              }

            })
            .catch(err => {
              console.error(err);
              alert("Something went wrong during verification.");
            });

        },

        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          }
        },

        theme: {
          color: "#00ff88"
        }
      };

      var rzp = new Razorpay(options);
      rzp.open();

    })
    .catch(err => {
      console.error(err);
      alert("Order creation failed.");
    });
}
