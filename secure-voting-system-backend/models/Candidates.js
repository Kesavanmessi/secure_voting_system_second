const mongoose = require('mongoose');

const candidateItemSchema = new mongoose.Schema({
  candidateId: { type: String, required: false }, // Made optional, generated if missing
  candidateName: { type: String, required: true },
  email: { type: String, required: false }, // Added for result notifications
  profile: { type: String, required: false }, // URL to profile image
}, { strict: false });

const candidateSchema = new mongoose.Schema({
  listname: { type: String, required: true },
  candidates: {
    type: [candidateItemSchema],
    default: [], // Remove default NOTA to prevent duplicates
  },
});

module.exports = mongoose.model('Candidate', candidateSchema);
