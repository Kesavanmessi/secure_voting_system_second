const mongoose = require('mongoose');

const PendingVoterListSchema = new mongoose.Schema({
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
  voters: [{
    voterId: { type: String, required: true },
    voterName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    age: { type: Number, required: true }
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
PendingVoterListSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PendingVoterList', PendingVoterListSchema); 