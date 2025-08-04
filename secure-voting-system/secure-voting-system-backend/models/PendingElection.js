const mongoose = require('mongoose');

const PendingElectionSchema = new mongoose.Schema({
  electionName: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  voterLists: [{ type: String, required: true }],
  candidateLists: [{ type: String, required: true }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PendingElection', PendingElectionSchema);
