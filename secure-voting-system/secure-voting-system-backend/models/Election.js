const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
  electionName: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: String,
    required: true
  },
  voterLists: [{  // Renamed from voters for clarity, if these are lists
    type: String,
    required: true
  }],
  candidateLists: [{  // Renamed from candidates for clarity, if these are lists
    type: String,
    required: true
  }],
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
