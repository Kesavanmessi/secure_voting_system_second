const mongoose = require('mongoose');

const PendingCandidateListSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  requestedBy: {
    adminId: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, required: true }
  },
  listname: {
    type: String,
    required: true
  },
  candidates: [{
    candidateId: { type: String, required: true },
    candidateName: { type: String, required: true },
    party: { type: String, required: true },
    symbol: { type: String, required: true }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    adminId: { type: String },
    username: { type: String },
    role: { type: String }
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PendingCandidateListSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PendingCandidateList', PendingCandidateListSchema); 