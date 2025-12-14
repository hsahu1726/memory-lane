const mongoose = require('mongoose');

const CapsuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  unlockDate: { type: Date, required: true },
  
  // 'LOCKED' or 'UNLOCKED'
  status: { 
    type: String, 
    enum: ['LOCKED', 'UNLOCKED'], 
    default: 'LOCKED' 
  },

  theme: {
        type: String,
        required: true, // Making it required ensures every capsule gets a theme
        default: 'General'
    },

    contributors: {
        type: String, // Store names/emails as a comma-separated string
        default: 'Creator Only'
    },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Capsule', CapsuleSchema);