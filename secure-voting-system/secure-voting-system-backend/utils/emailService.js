const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD // Your Gmail app password
    }
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send election creation notification
const sendElectionCreationEmail = async (voterEmail, voterName, electionName, voterId, randomPassword) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: voterEmail,
      subject: `Election Registration - ${electionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Election Registration Confirmation</h2>
          <p>Dear ${voterName},</p>
          <p>You have been successfully registered for the election: <strong>${electionName}</strong></p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">Your Login Details:</h3>
            <p><strong>Election Name:</strong> ${electionName}</p>
            <p><strong>Voter ID:</strong> ${voterId}</p>
            <p><strong>Email:</strong> ${voterEmail}</p>
            <p><strong>Password:</strong> <span style="background-color: #fff3cd; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${randomPassword}</span></p>
          </div>
          <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h4 style="color: #0c5460; margin-top: 0;">Important Security Notice:</h4>
            <p style="margin-bottom: 0;">You will need both this password and an OTP (sent to your email) to log in. Keep this password secure and do not share it with anyone.</p>
          </div>
          <p>You will receive notifications when the election starts and ends.</p>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Election creation email sent to ${voterEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending election creation email:', error);
    return false;
  }
};

// Send election start notification
const sendElectionStartEmail = async (voterEmail, voterName, electionName, startTime, endTime) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: voterEmail,
      subject: `Election Started - ${electionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">Election Has Started!</h2>
          <p>Dear ${voterName},</p>
          <p>The election <strong>${electionName}</strong> has now started.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Election Details:</h3>
            <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
            <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()}</p>
          </div>
          <p>Please log in to cast your vote.</p>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Election start email sent to ${voterEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending election start email:', error);
    return false;
  }
};

// Send election end notification
const sendElectionEndEmail = async (voterEmail, voterName, electionName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: voterEmail,
      subject: `Election Ended - ${electionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Election Has Ended</h2>
          <p>Dear ${voterName},</p>
          <p>The election <strong>${electionName}</strong> has now ended.</p>
          <p>Results will be published soon.</p>
          <p>Thank you for participating in the democratic process.</p>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Election end email sent to ${voterEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending election end email:', error);
    return false;
  }
};

// Send OTP email
const sendOTPEmail = async (voterEmail, voterName, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: voterEmail,
      subject: 'Voting OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">OTP Verification</h2>
          <p>Dear ${voterName},</p>
          <p>Your OTP for voting verification is:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="color: #27ae60; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${voterEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendElectionCreationEmail,
  sendElectionStartEmail,
  sendElectionEndEmail,
  sendOTPEmail
}; 