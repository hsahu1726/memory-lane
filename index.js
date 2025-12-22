"use strict";

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Resend } = require("resend");

const User = require("./models/User");
const Comment = require("./models/Comment");
const auth = require("./middleware/auth");

const app = express();

/* ===================== CONFIG ===================== */

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;
const resend = new Resend(process.env.RESEND_API_KEY);

/* ===================== MIDDLEWARE ===================== */

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

const UPLOADS_PATH = path.join(__dirname, "uploads");
app.use("/uploads", express.static(UPLOADS_PATH));

/* ===================== DATABASE ===================== */

if (!process.env.MONGO_URI) {
  console.error(" MONGO_URI missing");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => {
    console.error(" MongoDB connection failed:", err);
    process.exit(1);
  });

/* ===================== MODELS ===================== */

const capsuleSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  message: String,
  image: String,
  unlockDate: Date,
  recipientEmail: String,
  theme: String,
  contributors: String,
  status: { type: String, default: "LOCKED" },
  createdAt: { type: Date, default: Date.now },
});

const Capsule = mongoose.model("Capsule", capsuleSchema);

/* ===================== MULTER ===================== */

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ===================== AUTH ROUTES ===================== */

app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    await User.create({ email, password, name });
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

/* ===================== CAPSULE ROUTES ===================== */

app.get("/api/capsules", auth, async (req, res) => {
  const capsules = await Capsule.find({ creatorId: req.userId }).sort({
    createdAt: -1,
  });
  res.json(capsules);
});

app.get("/api/capsules/:id", auth, async (req, res) => {
  const capsule = await Capsule.findById(req.params.id);
  if (!capsule) return res.status(404).json({ message: "Not found" });

  if (capsule.creatorId.toString() !== req.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(capsule);
});

app.post("/api/capsules", auth, upload.single("file"), async (req, res) => {
  const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

  const capsule = new Capsule({
    creatorId: req.userId,
    title: req.body.title,
    message: req.body.message,
    theme: req.body.theme,
    contributors: req.body.contributors,
    recipientEmail: req.body.recipientEmail,
    unlockDate: new Date(req.body.unlockDate),
    image: imagePath,
  });

  await capsule.save();
  res.status(201).json(capsule);
});

/* ===================== COMMENTS ===================== */

app.post("/api/capsules/:id/comments", auth, async (req, res) => {
  const capsule = await Capsule.findById(req.params.id);
  if (!capsule || capsule.status !== "UNLOCKED") {
    return res.status(403).json({ message: "Capsule locked" });
  }

  const comment = await Comment.create({
    capsuleId: capsule._id,
    creatorId: req.userId,
    creatorName: req.body.creatorName,
    content: req.body.content,
  });

  res.status(201).json(comment);
});

/* ===================== EMAIL HELPER ===================== */

async function sendUnlockEmail(to, capsuleId, title) {
  return resend.emails.send({
    from: `Memory Lane <${process.env.FROM_EMAIL}>`,
    to,
    subject: `Treasure unlocked: ${title}`,
    html: `<p>Your memory is ready.</p>
           <a href="${FRONTEND_URL}/view/${capsuleId}">Open Memory</a>`,
  });
}

/* ===================== CRON ENDPOINT (IMPORTANT) ===================== */

app.get("/api/cron/unlock", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const now = new Date();
  const capsules = await Capsule.find({
    unlockDate: { $lte: now },
    status: "LOCKED",
  });

  for (const cap of capsules) {
    cap.status = "UNLOCKED";
    await cap.save();

    if (cap.recipientEmail) {
      try {
        await sendUnlockEmail(cap.recipientEmail, cap._id, cap.title);
      } catch (err) {
        console.error(" Email failed:", err);
      }
    }
  }

  res.json({ unlocked: capsules.length });
});

/* ===================== START ===================== */

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
