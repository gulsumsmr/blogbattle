const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  votedFor: {
    type: String,
    enum: ['A', 'B'],
    required: true
  }
}, {
  timestamps: true
});

// Ensure one vote per user per match
voteSchema.index({ user: 1, match: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
