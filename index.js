require("dotenv").config();

const path = require("path");
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE ORDER
app.post("/create-order", async (req, res) => {
  try {
    const { amount, plan } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${plan}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: plan,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// VERIFY PAYMENT
app.post("/verify-payment", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false });
  }

  let downloadRoute = "";

  if (plan === "Basic Plan") downloadRoute = "/download/basic";
  if (plan === "Standard Plan") downloadRoute = "/download/standard";
  if (plan === "Premium Plan") downloadRoute = "/download/premium";

  return res.json({
    success: true,
    download: downloadRoute,
  });
});

// SECURE DOWNLOAD
app.get("/download/:plan", (req, res) => {
  const plan = req.params.plan;

  let fileName = "";

  if (plan === "basic") fileName = "basic.pdf";
  if (plan === "standard") fileName = "standard.pdf";
  if (plan === "premium") fileName = "premium.pdf";

  if (!fileName) {
    return res.status(404).send("Invalid plan");
  }

  const filePath = path.join(__dirname, "files", fileName);

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("File not found");
    }
  });
});

// ROOT CHECK
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
