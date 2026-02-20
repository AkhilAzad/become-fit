require("dotenv").config();

const crypto = require("crypto");

const PLAN_CONFIG = {
  "Basic Plan": { slug: "basic", file: "basic.pdf" },
  "Standard Plan": { slug: "standard", file: "standard.pdf" },
  "Premium Plan": { slug: "premium", file: "premium.pdf" },
};

function getRazorpaySecret() {
  return process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || process.env.RAZORPAY_SECRET_KEY;
}

module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const razorpaySecret = getRazorpaySecret();

  if (!razorpaySecret) {
    return res.status(503).json({ success: false, error: "Payment service unavailable" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !PLAN_CONFIG[plan]) {
    return res.status(400).json({ success: false, error: "Invalid payment payload" });
  }

  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", razorpaySecret)
    .update(payload)
    .digest("hex");

  const isValidSignature =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

  if (!isValidSignature) {
    return res.status(400).json({ success: false, error: "Payment verification failed" });
  }

  return res.status(200).json({
    success: true,
    download: `/api/download/${PLAN_CONFIG[plan].slug}`,
  });
};
