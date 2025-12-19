"use strict";

require("dotenv").config();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

let genAIClient;
async function initGenAI() {
  const { GoogleGenAI } = await import("@google/genai");
  genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log("Gemini AI initialized");
}
initGenAI().catch((err) => console.error("Gemini init failed:", err));

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cron = require("node-cron");
const jwt = require("jsonwebtoken");

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const User = require("./models/User");
const auth = require("./middleware/auth");

const path = require("path");
const UPLOADS_PATH = path.join(__dirname, "uploads");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(UPLOADS_PATH));

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI missing");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

const capsuleSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  message: String,
  image: String,
  unlockDate: Date,
  isEvent: Boolean,
  eventType: String,
  recipientEmail: String,
  theme: String,
  contributors: String,
  status: { type: String, default: "LOCKED" },
  createdAt: { type: Date, default: Date.now },
});

const Capsule = mongoose.model("Capsule", capsuleSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    await User.create({ email, password, name });
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/api/capsules", auth, async (req, res) => {
  try {
    const capsules = await Capsule.find({ creatorId: req.userId }).sort({ createdAt: -1 });
    res.json(capsules);
  } catch {
    res.status(500).json({ message: "Failed to fetch capsules" });
  }
});

app.get("/api/capsules/:id", async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: "Not found" });
    res.json(capsule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/capsules", auth, upload.single("file"), async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const capsule = new Capsule({
      creatorId: req.userId,
      title: req.body.title,
      message: req.body.message,
      theme: req.body.theme,
      contributors: req.body.contributors,
      recipientEmail: req.body.recipientEmail || undefined,
      unlockDate: new Date(req.body.unlockDate),
      image: imagePath,
      status: "LOCKED",
    });

    await capsule.save();
    res.status(201).json(capsule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const Comment = require("./models/Comment");

app.post("/api/capsules/:id/comments", auth, async (req, res) => {
  try {
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
  } catch {
    res.status(500).json({ message: "Comment failed" });
  }
});

app.get("/api/capsules/:id/comments", async (req, res) => {
  const comments = await Comment.find({ capsuleId: req.params.id }).sort({ createdAt: 1 });
  res.json(comments);
});

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const capsules = await Capsule.find({ unlockDate: { $lte: now }, status: "LOCKED" });

  for (const cap of capsules) {
    cap.status = "UNLOCKED";
    await cap.save();

    if (cap.recipientEmail) {
      try {
        await resend.emails.send({
          from: "Memory Lane <onboarding@resend.dev>",
          to: cap.recipientEmail,
          subject: `Treasure unlocked: ${cap.title}`,
          html: `<a href="${FRONTEND_URL}/view/${cap._id}">Open memory</a>`,
        });
      } catch (err) {
        console.error("Email send failed:", err);
      }
    }
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
