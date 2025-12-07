const mongoose = require('mongoose');

const RejectedModificationSchema = new mongoose.Schema({
    originalElectionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Election' },
    updatedFields: {
        electionName: { type: String },
        voterLists: [{ type: String }],
        candidateLists: [{ type: String }],
        startTime: { type: Date },
        endTime: { type: Date }
    },
    modifiedBy: { type: String, required: true },
    rejectionReason: { type: String, required: true },
    rejectedBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RejectedModification', RejectedModificationSchema);
