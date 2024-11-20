const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  listname: { type: String, required: true },
  candidates: [
    {
      candidateId: { type: String, required: true },
      candidateName: { type: String, required: true },
      party: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('Candidate', candidateSchema);
