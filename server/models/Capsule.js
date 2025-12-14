const mongoose = require('mongoose');

const CapsuleSchema = new mongoose.Schema({
  creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Links this ID to the new 'User' model
    },
  title: { type: String, required: true },
  message: { type: String, required: true },
  unlockDate: { type: Date, required: true },
  privacyType: {
        type: String,
        enum: ['PRIVATE', 'PUBLIC', 'SHARED'], // Define the allowed states
        default: 'PRIVATE',
        required: true,
    },

  allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // List of user IDs who can view the capsule
  }], 
  
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