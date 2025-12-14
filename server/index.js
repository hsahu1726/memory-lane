require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const UPLOADS_PATH = 'C:\\Users\\hp\\OneDrive\\Desktop\\MemoryLane\\memory-lane\\server\\uploads';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 1. SERVE UPLOADED IMAGES STATICALLY
app.use("/uploads", express.static(UPLOADS_PATH));

// 2. MONGODB CONNECTION
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("FATAL ERROR: MONGO_URI is not set in the .env file!");
    process.exit(1); // Stop the server if the URI is missing
}

mongoose.connect(mongoUri)
    .then(() => console.log("✅ MongoDB Atlas Connected!"))
    .catch(err => console.error("❌ MongoDB Atlas Connection Failed:", err));

// 3. UPDATED SCHEMA (Supports All Features)
const capsuleSchema = new mongoose.Schema({
  title: String,
  message: String,          // The main story
  image: String,            // Path to uploaded image
  unlockDate: Date,
  isEvent: Boolean,         // True if unlocked by "Life Event"
  eventType: String,        // e.g., "Wedding", "Graduation"
  recipientEmail: String,   // Who gets it?
  theme: String,            // e.g., "Childhood", "Funny"
  contributors: String,     // For Collaboration Mode
  status: { type: String, default: "LOCKED" },
  createdAt: { type: Date, default: Date.now }
});

const Capsule = mongoose.model("Capsule", capsuleSchema);

// 4. IMAGE UPLOAD CONFIG (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists!
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------------- ROUTES ----------------

// GET ALL
app.get("/api/capsules", async (req, res) => {
  try {
    const capsules = await Capsule.find().sort({ createdAt: -1 });
    res.json(capsules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONE
app.get("/api/capsules/:id", async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    res.json(capsule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST (CREATE CAPSULE) - Now handles Files!
app.post("/api/capsules", upload.single("file"), async (req, res) => {
  try {
    // If file exists, save path. If not, null.
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const newCapsule = new Capsule({
      ...req.body,
      image: imagePath,
      status: "LOCKED" // Default
    });

    await newCapsule.save();
    res.status(201).json(newCapsule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✨ AI ROUTE (Gemini)
// Pass your API KEY here or in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/ai-polish", async (req, res) => {
  const { text, mode } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    let prompt = "";
    if (mode === "pirate") prompt = `Rewrite this as a 17th century pirate: "${text}"`;
    else if (mode === "poetic") prompt = `Rewrite this as a heartwarming nostalgic poem: "${text}"`;
    else prompt = `Fix grammar and make this memory sound more emotional and vivid: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const polishedText = response.text();
    
    res.json({ polishedText });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI fell overboard!" });
  }
});

const PORT = 5000;

// ... (Your existing imports)
const cron = require("node-cron");
const nodemailer = require("nodemailer");

// 1. SETUP EMAIL TRANSPORTER (Use Gmail for Hackathons)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hsahu1726.com", // Put your real email
    pass: "lskm iywq laga fyph",     // You need an App Password (not your normal password)
  },
});

// 2. THE CRON JOB (Runs every minute)
cron.schedule("* * * * *", async () => {
  console.log("⏳ Checking for unlocked memories...");
  
  const now = new Date();
  
  try {
    // Find capsules that are:
    // 1. PAST their unlock date
    // 2. Still marked as "LOCKED" (or have a new flag "NOTIFIED: false")
    const capsulesToUnlock = await Capsule.find({
      unlockDate: { $lte: now },
      status: "LOCKED" 
    });

    for (const cap of capsulesToUnlock) {
      console.log(`🔓 Unlocking capsule: ${cap.title}`);
      
      // A. Update Status in DB
      cap.status = "UNLOCKED";
      await cap.save();

      // B. Send Email if recipient exists
      if (cap.recipientEmail) {
        const mailOptions = {
          from: '"Dead Man\'s Chest" <your-email@gmail.com>',
          to: cap.recipientEmail,
          subject: `🏴‍☠️ Treasure Unlocked: ${cap.title}`,
          html: `
            <h1>The time has come, Matey!</h1>
            <p>A memory buried for you has just surfaced.</p>
            <p><strong>Message:</strong> "${cap.message.substring(0, 50)}..."</p>
            <a href="http://localhost:3000/view/${cap._id}" style="padding: 10px 20px; background: #d97706; color: white; text-decoration: none; border-radius: 5px;">
              Claim Treasure
            </a>
          `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.log("Error sending email:", error);
          else console.log("Email sent: " + info.response);
        });
      }
    }
  } catch (err) {
    console.error("Cron Error:", err);
  }
});
app.listen(PORT, () => console.log(`Server sailing on port ${PORT}`));