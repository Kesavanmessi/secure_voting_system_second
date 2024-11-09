// models/Election.js
const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
  electionName: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
      // Assuming this refers to an Admin user ID
    type: String,
    required: true
  },
  voters: {
    type: String,  // List of voter IDs or names depending on your implementation
    required: true
  },
  candidates: {
    type: String,  // List of candidate IDs or names
    required: true
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
