// models/Election.js
const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
  electionName: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,  // Assuming this refers to an Admin user ID
    ref: 'Admin',
    required: true
  },
  voters: {
    type: [String],  // List of voter IDs or names depending on your implementation
    default: []
  },
  candidates: {
    type: [String],  // List of candidate IDs or names
    default: []
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isResultPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Election', ElectionSchema);
