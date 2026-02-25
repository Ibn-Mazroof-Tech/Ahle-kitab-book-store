const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const booksPath = path.join(__dirname, "data", "books.json");
const books = JSON.parse(fs.readFileSync(booksPath, "utf-8"));

const razorpayEnabled = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const razorpay = razorpayEnabled
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

function normalizeCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const map = new Map(books.map((book) => [book.id, book]));
  const normalized = [];

  for (const entry of items) {
    const book = map.get(entry.id);
    const quantity = Number(entry.quantity || 1);

    if (!book || Number.isNaN(quantity) || quantity < 1 || quantity > 10) {
      continue;
    }

    normalized.push({
      id: book.id,
      title: book.title,
      price: book.price,
      quantity
    });
  }

  return normalized;
}

function calculateAmountInPaise(items) {
  const totalInRupees = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return totalInRupees * 100;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, razorpayEnabled });
});

app.get("/api/books", (_req, res) => {
  res.json({ books });
});

app.get("/api/books/:id", (req, res) => {
  const book = books.find((item) => item.id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: "Book not found." });
  }
  return res.json({ book });
});

app.post("/api/create-order", async (req, res) => {
  try {
    if (!razorpayEnabled) {
      return res.status(500).json({
        error: "Razorpay keys are missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
      });
    }

    const items = normalizeCartItems(req.body.items);
    if (items.length === 0) {
      return res.status(400).json({ error: "Cart is empty or invalid." });
    }

    const amount = calculateAmountInPaise(items);
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `ahlekitab_${Date.now()}`,
      notes: {
        customer_name: String(req.body.customer?.name || "Guest").slice(0, 64),
        customer_phone: String(req.body.customer?.phone || "").slice(0, 20)
      }
    });

    return res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (_error) {
    return res.status(500).json({ error: "Unable to create payment order." });
  }
});

app.post("/api/verify-payment", (req, res) => {
  try {
    if (!razorpayEnabled) {
      return res.status(500).json({ error: "Razorpay is not configured." });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Payment payload is incomplete." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Signature mismatch." });
    }

    return res.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (_error) {
    return res.status(500).json({ error: "Payment verification failed." });
  }
});

app.get("*", (_req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Ahle Kitab server running on http://localhost:${PORT}`);
});
