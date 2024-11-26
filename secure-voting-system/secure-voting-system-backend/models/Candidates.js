const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  listname: { type: String, required: true },
  candidates: {
    type: [
      {
        candidateId: { type: String, required: true },
        candidateName: { type: String, required: true },
        party: { type: String, required: true },
      },
    ],
    default: [
      {
        candidateId: 'C1NOTA2',
        candidateName: 'None of the Above',
        party: 'NOTA',
      },
    ], // Default value for candidates array
  },
});

module.exports = mongoose.model('Candidate', candidateSchema);
