require("dotenv").config();

const path = require("path");
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
<<<<<<< HEAD
=======
const fs = require("fs");
>>>>>>> 206bbe52fed535c60f0c7b11a487e9490f8afb87

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const FILES_DIR = path.join(__dirname, "files");

const PLAN_CONFIG = {
  "Basic Plan": { slug: "basic", file: "basic.pdf" },
  "Standard Plan": { slug: "standard", file: "standard.pdf" },
  "Premium Plan": { slug: "premium", file: "premium.pdf" },
};

const DOWNLOAD_TO_FILE = Object.fromEntries(
  Object.values(PLAN_CONFIG).map((entry) => [entry.slug, entry.file])
);

<<<<<<< HEAD
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
=======
function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEYID;
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || process.env.RAZORPAY_SECRET_KEY;

  return { keyId, keySecret };
}

function getRazorpaySecret() {
  return getRazorpayCredentials().keySecret;
}

const { keyId, keySecret } = getRazorpayCredentials();

if (!keyId || !keySecret) {
>>>>>>> 206bbe52fed535c60f0c7b11a487e9490f8afb87
  console.warn("Warning: Razorpay credentials are not fully configured.");
}

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use(
  express.static(PUBLIC_DIR, {
    maxAge: "1d",
    etag: true,
  })
);

const pages = ["index", "about", "contact", "payment", "success", "privacy", "refund", "terms"];

pages.forEach((page) => {
  const route = page === "index" ? "/" : `/${page}`;
  app.get(route, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, `${page}.html`));
  });
});

const razorpay =
<<<<<<< HEAD
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
=======
  keyId && keySecret
    ? new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
>>>>>>> 206bbe52fed535c60f0c7b11a487e9490f8afb87
      })
    : null;

app.post("/create-order", async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Payment service unavailable" });
    }

    const amount = Number(req.body.amount);
    const plan = String(req.body.plan || "").trim();

    if (!Number.isFinite(amount) || amount <= 0 || !PLAN_CONFIG[plan]) {
      return res.status(400).json({ error: "Invalid amount or plan" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${PLAN_CONFIG[plan].slug}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
<<<<<<< HEAD
      key: process.env.RAZORPAY_KEY_ID,
=======
      key: keyId,
>>>>>>> 206bbe52fed535c60f0c7b11a487e9490f8afb87
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ error: "Order creation failed" });
  }
});

app.post("/verify-payment", (req, res) => {
<<<<<<< HEAD
  if (!process.env.RAZORPAY_KEY_SECRET) {
=======
  const razorpaySecret = getRazorpaySecret();

  if (!razorpaySecret) {
>>>>>>> 206bbe52fed535c60f0c7b11a487e9490f8afb87
    return res.status(503).json({ success: false, error: "Payment service unavailable" });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !PLAN_CONFIG[plan]) {
    return res.status(400).json({ success: false, error: "Invalid payment payload" });
  }

  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
<<<<<<< HEAD
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
=======
    .createHmac("sha256", razorpaySecret)
>>>>>>> 206bbe52fed535c60f0c7b11a487e9490f8afb87
    .update(payload)
    .digest("hex");

  const isValidSignature =
    expectedSignature.length === razorpay_signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

  if (!isValidSignature) {
    return res.status(400).json({ success: false });
  }

  return res.json({
    success: true,
    download: `/download/${PLAN_CONFIG[plan].slug}`,
  });
});

app.get("/download/:plan", (req, res) => {
  const fileName = DOWNLOAD_TO_FILE[req.params.plan];

  if (!fileName) {
    return res.status(404).send("Invalid plan");
  }

  const filePath = path.join(FILES_DIR, fileName);

<<<<<<< HEAD
=======
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

>>>>>>> 206bbe52fed535c60f0c7b11a487e9490f8afb87
  return res.download(filePath, fileName, (err) => {
    if (err && !res.headersSent) {
      console.error("Download error:", err);
      res.status(500).send("File not found");
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
