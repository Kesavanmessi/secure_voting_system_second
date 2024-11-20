const mongoose = require('mongoose');

const electionCandidateSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Election' , unique: true },
  candidates:[{
  candidateId: { type: String, required: true },
  voteCount: { 
    type: String, // Store encrypted value as a string
    required: true,
  }
}]});

  
  module.exports = mongoose.model('ElectionCandidates', electionCandidateSchema);
  