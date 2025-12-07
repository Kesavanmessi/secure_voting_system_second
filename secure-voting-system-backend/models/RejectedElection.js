const mongoose = require('mongoose');

const RejectedElectionSchema = new mongoose.Schema({
    electionName: { type: String, required: true },
    createdBy: { type: String, required: true },
    voterLists: [{ type: String, required: true }],
    candidateLists: [{ type: String, required: true }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    rejectionReason: { type: String, required: true },
    rejectedBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RejectedElection', RejectedElectionSchema);
