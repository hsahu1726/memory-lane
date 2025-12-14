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

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Capsule', CapsuleSchema);