const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  bracketId: {
    type: String,
    required: true,
    index: true
  },
  postA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  postB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  votesA: {
    type: Number,
    default: 0
  },
  votesB: {
    type: Number,
    default: 0
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  isFinal: {
    type: Boolean,
    default: false
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Calculate total votes
matchSchema.virtual('totalVotes').get(function() {
  return this.votesA + this.votesB;
});

// Calculate percentages
matchSchema.virtual('percentageA').get(function() {
  const total = this.totalVotes;
  return total > 0 ? Math.round((this.votesA / total) * 100) : 0;
});

matchSchema.virtual('percentageB').get(function() {
  const total = this.totalVotes;
  return total > 0 ? Math.round((this.votesB / total) * 100) : 0;
});

// Ensure virtuals are included in JSON
matchSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Match', matchSchema);
