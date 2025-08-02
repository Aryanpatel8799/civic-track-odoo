const mongoose = require('mongoose');

const userUpvoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one upvote per user per issue
userUpvoteSchema.index({ user: 1, issue: 1 }, { unique: true });

const UserUpvote = mongoose.model('UserUpvote', userUpvoteSchema);

module.exports = UserUpvote;
