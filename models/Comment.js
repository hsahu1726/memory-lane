// server/models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    capsuleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Capsule' // Link to the Capsule
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Link to the User who wrote the comment
    },
    creatorName: {
        type: String, // Store the user's display name
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', CommentSchema);