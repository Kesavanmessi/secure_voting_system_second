const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  electionId: { type: String, required: true },
  otp: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // OTP expires in 10 minutes
});

module.exports = mongoose.model('OTP', OTPSchema); 