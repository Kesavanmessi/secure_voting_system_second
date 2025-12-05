const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const OTP = require('../models/OTP');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendPasswordResetOTPEmail, generateOTP } = require('../utils/emailService');
require('dotenv').config();

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(200).json({ success: false, message: 'Admin not found' });
    }
    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(200).json({ success: false, message: 'Invalid password' });
    }

    // Create a JWT token containing admin info, role, and permissions
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }  // Token expires in 5 minutes
    );

    // Send the token and admin details as response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions,
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { adminId } = req.body; // adminId is treated as the email
  try {
    const admin = await Admin.findOne({ adminId });
    if (!admin) {
      return res.status(200).json({ success: false, message: 'Admin not found with this Email ID' });
    }

    const otp = generateOTP();
    const newOTP = new OTP({
      email: adminId,
      otp: otp,
    });
    await newOTP.save();

    await sendPasswordResetOTPEmail(adminId, admin.username, otp);

    res.status(200).json({ success: true, message: 'OTP sent to your registered Email ID' });
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    res.status(500).json({ success: false, message: 'Server error sending OTP' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { adminId, otp, newPassword } = req.body;
  try {
    // Verify OTP
    const otpRecord = await OTP.findOne({ email: adminId, otp }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(200).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash new password
    // NOTE: Admin model hash middleware handles password hashing on save, 
    // BUT only if we assign plain text to password field and save the document.
    const admin = await Admin.findOne({ adminId });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    admin.password = newPassword; // Middleware will hash this
    await admin.save();

    // Delete used OTP
    await OTP.deleteMany({ email: adminId });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
});

module.exports = router;
