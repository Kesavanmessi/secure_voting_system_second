const mongoose = require('mongoose');

const VoteLogSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Election' },
  voterId: { type: String, required: true },
  candidateId: { type: String, required: true },
  hash: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VoteLog', VoteLogSchema);
