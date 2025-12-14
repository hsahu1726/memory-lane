require("dotenv").config();
const { GoogleGenAI } = require('@google/generative-ai')
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');

// IMPORT AUTH COMPONENTS
const User = require('./models/User'); // User model is now required
const auth = require('./middleware/auth'); // NEW: JWT verification middleware

// --- CONFIG ---
const UPLOADS_PATH = 'C:\\Users\\hp\\OneDrive\\Desktop\\MemoryLane\\memory-lane\\server\\uploads';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 1. SERVE UPLOADED IMAGES STATICALLY
// NOTE: Using a hardcoded path like UPLOADS_PATH is risky. The original path.resolve(__dirname, "uploads") is better.
// Assuming your UPLOADS_PATH constant works for now.
app.use("/uploads", express.static(UPLOADS_PATH));

// 2. MONGODB CONNECTION (Same as before)
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("FATAL ERROR: MONGO_URI is not set in the .env file!");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log("✅ MongoDB Atlas Connected!"))
    .catch(err => console.error("❌ MongoDB Atlas Connection Failed:", err));

// 3. UPDATED SCHEMA (Adding creatorId)
const capsuleSchema = new mongoose.Schema({
    // NEW: Link to the User who created this capsule
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' 
    },
    
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
    createdAt: { type: Date, default: Date.now }
});

const Capsule = mongoose.model("Capsule", capsuleSchema);

// 4. IMAGE UPLOAD CONFIG (Multer - Same as before)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------------- AUTH ROUTES (Same as before) ----------------
// Note: We moved these up for better organization

// --- REGISTRATION ---
app.post('/api/register', async (req, res) => {
    try {
        // PULL NAME FROM REQUEST BODY
        const { email, password, name } = req.body; 
        
        // PASS NAME TO CREATE FUNCTION
        const user = await User.create({ email, password, name });
        
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already in use.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Send token and userId to the client
        res.json({ message: 'Login successful', token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// ---------------- PROTECTED CAPSULE ROUTES ----------------

// GET ALL (PROTECTED) - Now only fetches capsules for the logged-in user
app.get('/api/capsules', auth, async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Build the dynamic query based on the authenticated user ID
        const query = {
            $or: [
                // RULE 1: Creator can always see their own PRIVATE/SHARED capsules
                { creatorId: userId },

                // RULE 2: Anyone (logged in) can see PUBLIC capsules
                { privacyType: 'PUBLIC' },

                // RULE 3: Users explicitly shared with (SHARED capsules)
                {
                    privacyType: 'SHARED',
                    allowedUsers: { $in: [userId] } // User ID is in the allowedUsers array
                }
            ]
        };
        
        // Find capsules that match ANY of the rules in the $or array
        const capsules = await Capsule.find(query).sort({ createdAt: -1 });
        
        res.status(200).json(capsules);
    } catch (error) {
        console.error('Error fetching capsules:', error);
        res.status(500).json({ message: 'Failed to fetch capsules.' });
    }
});

// GET ONE (UNPROTECTED) - Still accessible without login, but only shows data
app.get("/api/capsules/:id", async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) return res.status(404).json({ message: "Capsule not found." });
    res.json(capsule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST (CREATE CAPSULE) - PROTECTED
app.post("/api/capsules", auth, upload.single("file"), async (req, res) => { // ADDED 'auth' middleware
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const newCapsule = new Capsule({
      ...req.body,
      creatorId: req.userId, // CRITICAL: Link capsule to logged-in user
      image: imagePath,
      status: "LOCKED" 
    });

    await newCapsule.save();
    res.status(201).json(newCapsule);
  } catch (err) {
    console.error("Error creating capsule:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- AI ROUTE (Gemini) ----------------
const { GoogleGenerativeAI } = require("@google/generative-ai");


app.post("/api/ai-polish", async (req, res) => {
  const { text, mode } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
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

// ---------------- CRON JOB (Same as before) ----------------
const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net", 
    port: 587,
    secure: false, 
    auth: {
        user: 'apikey', 
        pass: process.env.SENDGRID_API_KEY, 
    },
});

cron.schedule("* * * * *", async () => {
  console.log("⏳ Checking for unlocked memories...");
  
  // ... (Cron logic remains the same)
  const now = new Date();
  
  try {
    const capsulesToUnlock = await Capsule.find({
      unlockDate: { $lte: now },
      status: "LOCKED" 
    });

    for (const cap of capsulesToUnlock) {
      console.log(`🔓 Unlocking capsule: ${cap.title}`);
      
      cap.status = "UNLOCKED";
      await cap.save();

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

const PORT = 5000;

// --- In server/index.js (After Capsule routes) ---

const Comment = require('./models/Comment'); // Import the new model

// 1. POST: Submit a new comment to an unlocked capsule (PROTECTED)
app.post('/api/capsules/:id/comments', auth, async (req, res) => {
    try {
        const capsuleId = req.params.id;
        const { content, creatorName } = req.body;

        // Optional: Check if the capsule is UNLOCKED before allowing comment
        const capsule = await Capsule.findById(capsuleId);
        if (!capsule || capsule.status !== 'UNLOCKED') {
            return res.status(403).json({ message: 'Capsule is locked. No interaction allowed yet.' });
        }
        
        const newComment = new Comment({
            capsuleId,
            creatorId: req.userId,
            creatorName, // Comes from the client side (stored in localStorage)
            content,
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error submitting comment:', error);
        res.status(500).json({ message: 'Failed to submit comment.' });
    }
});

// 2. GET: Fetch all comments for a specific capsule
app.get('/api/capsules/:id/comments', async (req, res) => {
    try {
        const capsuleId = req.params.id;
        // Fetch comments and sort them by creation date
        const comments = await Comment.find({ capsuleId }).sort({ createdAt: 1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments.' });
    }
});
app.listen(PORT, () => console.log(`Server sailing on port ${PORT}`));