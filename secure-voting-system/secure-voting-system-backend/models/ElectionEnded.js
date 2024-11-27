const mongoose = require('mongoose');

const electionEndedSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  electionName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  votersParticipated: { type: [String], default: [] }, // Array of voter IDs who participated
  votersNotParticipated: { type: [String], default: [] }, // Array of voter IDs who did not participate
  candidates: [
    {
      candidateId: { type: String, required: true },
      name: { type: String, required: true },
      party: { type: String, required: true },
      votes: { type: Number, required: true },
    },
  ],
  winner: {
    candidateId: { type: String, required: true },
    name: { type: String, required: true },
    party: { type: String, required: true },
    votes: { type: Number, required: true },
  },
  createdBy: { type: String, required: true }, // Admin who created the election
});

module.exports = mongoose.model('ElectionEnded', electionEndedSchema);
