const mongoose = require('mongoose');

// Define the Candidate schema with the 'listname' and 'candidates' array
const candidateSchema = new mongoose.Schema({
  listname: { type: String, required: true },
  candidates: [
    {
      candidateId: { type: String, required: true },
      candidateName: { type: String, required: true },
      party: { type: String, required: true },
      electionDetails: {
        position: { type: String, required: true },
        manifesto: { type: String, required: true }
      }
    }
  ]
});

module.exports = mongoose.model('Candidate', candidateSchema);
