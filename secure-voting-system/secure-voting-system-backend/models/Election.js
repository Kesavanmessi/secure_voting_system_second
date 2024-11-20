const mongoose = require('mongoose');

const ElectionSchema = new mongoose.Schema({
  electionName: { type: String, required: true, unique: true },
  createdBy: { type: String, required: true },
  approvedBy: { type: String, default: null },
  voterLists: [{ type: String, required: true }],
  candidateLists: [{ type: String, required: true }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  description:{
    type:String
  },
  isResultPublished: { type: Boolean, default: false } ,
   isPopulated: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Election', ElectionSchema);
