const mongoose = require('mongoose');

const candidateItemSchema = new mongoose.Schema({
  candidateId: { type: String, required: true },
  candidateName: { type: String, required: true },
}, { strict: false });

const candidateSchema = new mongoose.Schema({
  listname: { type: String, required: true },
  candidates: {
    type: [candidateItemSchema],
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
