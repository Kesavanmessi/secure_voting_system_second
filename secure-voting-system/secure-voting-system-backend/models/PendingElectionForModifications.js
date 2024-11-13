const mongoose = require('mongoose');

const PendingElectionForModificationsSchema = new mongoose.Schema({
  originalElectionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Election' },
  updatedFields: {
    electionName: { type: String },
    voterLists: [{ type: String }],
    candidateLists: [{ type: String }],
    startTime: { type: Date },
    endTime: { type: Date }
  },
  modifiedBy: { type: String, required: true } // Admin requesting modification
}, { timestamps: true });

module.exports = mongoose.model('PendingElectionForModifications', PendingElectionForModificationsSchema);
