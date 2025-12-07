const mongoose = require('mongoose');

const PendingElectionDeletionSchema = new mongoose.Schema({
    electionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Election' },
    electionName: { type: String, required: true },
    reason: { type: String },
    requestedBy: { type: String, required: true }, // Admin requesting deletion
    status: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected'] }
}, { timestamps: true });

module.exports = mongoose.model('PendingElectionDeletion', PendingElectionDeletionSchema);
