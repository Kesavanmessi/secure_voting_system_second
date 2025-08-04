const mongoose = require('mongoose');

// Define the Voter schema with the 'listname' and 'voters' array
const voterSchema = new mongoose.Schema({
  listname: { type: String, required: true },
  voters: [
    {
      voterId: { type: String, required: true },
      voterName: { type: String, required: true },
      email: { type: String, required: true }, // Added email field
      password: { type: String, required: false }, // Made optional since it's generated automatically
      address: { type: String, required: true },
      age: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Voter', voterSchema);
