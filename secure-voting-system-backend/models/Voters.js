const mongoose = require('mongoose');

// Define the Voter schema with the 'listname' and 'voters' array
const voterSchema = new mongoose.Schema({
  listname: { type: String, required: true },
  voters: [
    new mongoose.Schema({
      voterId: { type: String, required: false }, // Made optional, generated if missing
      voterName: { type: String, required: true },
      email: { type: String, required: true },
      password: { type: String, required: false },
      address: { type: String, required: false }, // Made optional
      age: { type: Number, required: false }      // Made optional
    }, { strict: false }) // Allow other flexible fields
  ]
});

module.exports = mongoose.model('Voter', voterSchema);
