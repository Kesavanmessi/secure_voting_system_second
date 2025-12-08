const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter for sending emails
// Create transporter for sending emails
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("❌ CRITICAL: EMAIL_USER or EMAIL_PASSWORD is missing in Environment Variables!");
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '',
      pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.trim() : ''
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
            <p><strong>Voter ID:</strong> <span style="font-weight: bold; color: #d35400;">${voterId}</span></p>
            <p><strong>Email:</strong> ${voterEmail}</p>
            <p><strong>Password:</strong> <span style="background-color: #fff3cd; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: bold;">${randomPassword}</span></p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
             <a href="http://localhost:5173/voter-login" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Vote</a>
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
const sendElectionStartEmail = async (voterEmail, voterName, electionName, startTime, endTime, voterId) => {
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
            <p><strong>Election Name:</strong> ${electionName}</p>
            <p><strong>Voter ID:</strong> <span style="font-weight: bold; color: #d35400;">${voterId}</span></p>
            <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
            <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
             <a href="http://localhost:5173/voter-login" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Cast Your Vote Now</a>
          </div>
          <p>Please log in using your Voter ID and Password.</p>
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
const sendElectionEndEmail = async (voterEmail, voterName, electionName, winnerName, isTie) => {
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
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
             <h3 style="color: #2c3e50; margin-top: 0;">Winner Announced!</h3>
             <h1 style="color: #f1c40f; margin: 10px 0; font-size: 28px;">🏆 ${winnerName || 'Winner Not Available'}</h1>
             ${isTie ? `
             <div style="background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin-top: 15px; font-size: 14px; border: 1px solid #ffeeba;">
                <strong>Tie Result:</strong> The candidates were tied for the highest votes. The winner was randomly selected by the system algorithm.
             </div>
             ` : ''}
          </div>
          <p style="text-align: center; color: #7f8c8d;">Full results including vote counts and margins are available in the voting application.</p>
          <div style="text-align: center; margin: 30px 0;">
             <a href="http://localhost:5173/voter-login" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Full Results</a>
          </div>
          <p>Thank you for participating in the democratic process.</p>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Election end email sent to ${voterEmail} `);
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
    console.log(`OTP email sent to ${voterEmail} `);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send Admin Approval Email
const sendAdminApprovalEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Access Approved - Secure Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Access Approved!</h2>
          <p>Hello ${username},</p>
          <p>Your request for <strong>Manager Admin</strong> access has been approved by the Head Admin.</p>
          <p>You can now log in to the admin dashboard using your credentials.</p>
          <p>
            <a href="http://localhost:5173/admin-login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a>
          </p>
          <p>If you did not request this, please contact support immediately.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${email} `);
    return true;
  } catch (error) {
    console.error('Error sending approval email:', error);
    return false;
  }
};

// Send Election Update Email
const sendElectionUpdateEmail = async (voterEmail, voterName, electionName, startTime, endTime) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: voterEmail,
      subject: `Important Update - Election: ${electionName} `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e67e22;">Election Schedule Updated</h2>
          <p>Dear ${voterName},</p>
          <p>The schedule for the election <strong>${electionName}</strong> has been updated.</p>
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">New Schedule:</h3>
            <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
            <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()}</p>
          </div>
          <p>Please make a note of these changes.</p>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Update email sent to ${voterEmail} `);
    return true;
  } catch (error) {
    console.error('Error sending update email:', error);
    return false;
  }
};

// Send Election Cancellation Email
const sendElectionCancellationEmail = async (voterEmail, voterName, electionName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: voterEmail,
      subject: `Election Cancelled - ${electionName} `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c0392b;">Election Cancelled</h2>
          <p>Dear ${voterName},</p>
          <p>We regret to inform you that the election <strong>${electionName}</strong> has been cancelled.</p>
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p style="color: #721c24; margin: 0;">This action was taken by the election administration. If you have any questions, please contact support.</p>
          </div>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent to ${voterEmail} `);
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return false;
  }
};

// Send Password Reset OTP Email
const sendPasswordResetOTPEmail = async (email, username, otp) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Secure Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>You have requested to reset your password for the admin portal.</p>
          <p>Your OTP for password reset is:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="color: #e67e22; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP email sent to ${email} `);
    return true;
  } catch (error) {
    console.error('Error sending password reset OTP email:', error);
    return false;
  }
};

// Send Admin Welcome Email (Created by Head Admin)
const sendAdminWelcomeEmail = async (email, username, password) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Secure Voting System - Admin Access',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Welcome, Admin!</h2>
          <p>Hello ${username},</p>
          <p>You have been added as an administrator to the <strong>Secure Voting System</strong> by the Head Admin.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Your Credentials:</h3>
            <p><strong>Username:</strong> ${username}</p>
            ${password ? `<p><strong>Password:</strong> ${password}</p>` : ''} 
          </div>
          <p>Please log in and change your password immediately if a temporary one was provided.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/admin-login" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
          </div>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email} `);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};
const sendVoteConfirmationEmail = async (voterEmail, voterName, electionName) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: voterEmail,
      subject: `Vote Confirmation - ${electionName} `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">Vote Recorded Successfully</h2>
          <p>Dear ${voterName},</p>
          <p>Your vote for the election <strong>${electionName}</strong> has been securely recorded.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <p style="margin: 0; color: #2c3e50;">We value your participation in this democratic process. Your choice remains confidential.</p>
          </div>

          <p>Results will be available on the portal once the election concludes.</p>
          <div style="text-align: center; margin: 30px 0;">
             <a href="http://localhost:5173/voter-login" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Return to Portal</a>
          </div>
          <p>Best regards,<br>Secure Voting System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Vote confirmation email sent to ${voterEmail} `);
    return true;
  } catch (error) {
    console.error('Error sending vote confirmation email:', error);
    return false;
  }
};

const sendAdminRemovalEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Admin Access Revoked - Secure Voting System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c0392b;">Access Revoked</h2>
          <p>Hello ${username},</p>
          <p>Your admin access to the <strong>Secure Voting System</strong> has been revoked by the Head Admin.</p>
          <p>You will no longer be able to log in to the admin dashboard.</p>
          <p>If you believe this is an error, please contact the Head Admin directly.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Removal email sent to ${email} `);
    return true;
  } catch (error) {
    console.error('Error sending removal email:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendElectionCreationEmail,
  sendElectionStartEmail,
  sendElectionEndEmail,
  sendOTPEmail,
  sendAdminApprovalEmail,
  sendElectionUpdateEmail,
  sendElectionCancellationEmail,
  sendAdminRemovalEmail,
  sendPasswordResetOTPEmail,
  sendAdminWelcomeEmail,
  sendVoteConfirmationEmail
};
