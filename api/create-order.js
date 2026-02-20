require("dotenv").config();

const Razorpay = require("razorpay");

const PLAN_CONFIG = {
  "Basic Plan": { slug: "basic", file: "basic.pdf" },
  "Standard Plan": { slug: "standard", file: "standard.pdf" },
  "Premium Plan": { slug: "premium", file: "premium.pdf" },
};

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Payment service unavailable" });
    }

    const amount = Number(req.body?.amount);
    const plan = String(req.body?.plan || "").trim();

    if (!Number.isFinite(amount) || amount <= 0 || !PLAN_CONFIG[plan]) {
      return res.status(400).json({ error: "Invalid amount or plan" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${PLAN_CONFIG[plan].slug}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ error: "Order creation failed" });
  }
};
