const mongoose = require('mongoose');

const electionVoterSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Election',unique:true },
  voters: [
    {
      voterId: { type: String, required: true},
      isVoted: { type: Boolean, default: false },
    }
  ],
});


module.exports = mongoose.model('ElectionVoters', electionVoterSchema);
