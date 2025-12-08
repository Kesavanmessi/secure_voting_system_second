const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

// Configure Brevo API Client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASSWORD;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Define Frontend URL (Use Env Var or default to localhost for dev)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generic function to send email via Brevo API
 */
const sendEmail = async (toEmail, toName, subject, htmlContent) => {
  if (!apiKey.apiKey) {
    console.error("❌ CRITICAL: BREVO_API_KEY is missing! Emails will fail.");
    return false;
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = { "name": "Secure Voting System", "email": process.env.EMAIL_USER || "securedelection1@gmail.com" };
  sendSmtpEmail.to = [{ "email": toEmail, "name": toName }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${toEmail}. Message ID: ${data.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${toEmail}:`, error);
    return false;
  }
};

// Send election creation notification
const sendElectionCreationEmail = async (voterEmail, voterName, electionName, voterId, randomPassword) => {
  const loginLink = `${FRONTEND_URL}/voter-login?electionName=${encodeURIComponent(electionName)}&voterId=${voterId}`;
  const subject = `Election Registration - ${electionName}`;
  const html = `
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
          <a href="${loginLink}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Vote</a>
      </div>
      <p style="text-align: center; font-size: 12px; color: #7f8c8d;">Or manually click: <a href="${loginLink}">${loginLink}</a></p>
      <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
        <h4 style="color: #0c5460; margin-top: 0;">Important Security Notice:</h4>
        <p style="margin-bottom: 0;">You will need both this password and an OTP (sent to your email) to log in. Keep this password secure and do not share it with anyone.</p>
      </div>
      <p>You will receive notifications when the election starts and ends.</p>
      <p>Best regards,<br>Secure Voting System</p>
    </div>
  `;
  return await sendEmail(voterEmail, voterName, subject, html);
};

// Send election start notification
const sendElectionStartEmail = async (voterEmail, voterName, electionName, startTime, endTime, voterId) => {
  const subject = `Election Started - ${electionName}`;
  const html = `
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
          <a href="${FRONTEND_URL}/voter-login" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Cast Your Vote Now</a>
      </div>
      <p>Please log in using your Voter ID and Password.</p>
      <p>Best regards,<br>Secure Voting System</p>
    </div>
  `;
  return await sendEmail(voterEmail, voterName, subject, html);
};

// Send election end notification
const sendElectionEndEmail = async (voterEmail, voterName, electionName, winnerName, isTie) => {
  const subject = `Election Ended - ${electionName}`;
  const html = `
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
          <a href="${FRONTEND_URL}/voter-login" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Full Results</a>
      </div>
      <p>Thank you for participating in the democratic process.</p>
      <p>Best regards,<br>Secure Voting System</p>
    </div>
  `;
  return await sendEmail(voterEmail, voterName, subject, html);
};

// Send OTP email
const sendOTPEmail = async (voterEmail, voterName, otp) => {
  const subject = 'Voting OTP Verification';
  const html = `
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
  `;
  return await sendEmail(voterEmail, voterName, subject, html);
};

// Send Admin Approval Email
const sendAdminApprovalEmail = async (email, username) => {
  const subject = 'Admin Access Approved - Secure Voting System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Access Approved!</h2>
      <p>Hello ${username},</p>
      <p>Your request for <strong>Manager Admin</strong> access has been approved by the Head Admin.</p>
      <p>You can now log in to the admin dashboard using your credentials.</p>
      <p>
        <a href="${FRONTEND_URL}/admin-login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Dashboard</a>
      </p>
      <p>If you did not request this, please contact support immediately.</p>
    </div>
  `;
  return await sendEmail(email, username, subject, html);
};

// Send Election Update Email
const sendElectionUpdateEmail = async (voterEmail, voterName, electionName, startTime, endTime) => {
  const subject = `Important Update - Election: ${electionName} `;
  const html = `
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
  `;
  return await sendEmail(voterEmail, voterName, subject, html);
};

// Send Election Cancellation Email
const sendElectionCancellationEmail = async (voterEmail, voterName, electionName) => {
  const subject = `Election Cancelled - ${electionName} `;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #c0392b;">Election Cancelled</h2>
      <p>Dear ${voterName},</p>
      <p>We regret to inform you that the election <strong>${electionName}</strong> has been cancelled.</p>
      <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <p style="color: #721c24; margin: 0;">This action was taken by the election administration. If you have any questions, please contact support.</p>
      </div>
      <p>Best regards,<br>Secure Voting System</p>
    </div>
  `;
  return await sendEmail(voterEmail, voterName, subject, html);
};

// Send Password Reset OTP Email
const sendPasswordResetOTPEmail = async (email, username, otp) => {
  const subject = 'Password Reset Request - Secure Voting System';
  const html = `
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
  `;
  return await sendEmail(email, username, subject, html);
};

// Send Admin Welcome Email (Created by Head Admin)
const sendAdminWelcomeEmail = async (email, username, password) => {
  const subject = 'Welcome to Secure Voting System - Admin Access';
  const html = `
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
        <a href="${FRONTEND_URL}/admin-login" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
      </div>
      <p>Best regards,<br>Secure Voting System</p>
    </div>
  `;
  return await sendEmail(email, username, subject, html);
};

const sendCandidateResultEmail = async (email, candidateName, electionName, rank, voteCount, totalVotes, winnerName) => {
  const subject = `Election Results: ${electionName}`;
  const isWinner = candidateName === winnerName;
  const statusColor = isWinner ? '#2ecc71' : '#34495e';

  const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
            <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0;">Election Concluded</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">${electionName}</p>
            </div>
            <div style="padding: 30px;">
                <p>Hello <strong>${candidateName}</strong>,</p>
                <p>The election <strong>${electionName}</strong> has officially ended. Here is your performance report:</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #7f8c8d;">Votes Received:</span>
                        <span style="font-weight: bold;">${voteCount}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #7f8c8d;">Total Votes Cast:</span>
                        <span style="font-weight: bold;">${totalVotes}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #7f8c8d;">Final Rank:</span>
                        <span style="font-weight: bold;">#${rank}</span>
                    </div>
                </div>

                <div style="text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                    <p style="margin-bottom: 5px; color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Winner</p>
                    <h3 style="margin: 0; color: #2c3e50;">${winnerName}</h3>
                    ${isWinner ? '<p style="color: #2ecc71; font-weight: bold; margin-top: 10px;">Congratulations! You have won the election!</p>' : ''}
                </div>
            </div>
        </div>
    `;
  return await sendEmail(email, candidateName, subject, html);
};

const sendAdminRemovalEmail = async (email, username, reason) => {
  const subject = 'Admin Access Revoked - Secure Voting System';
  const reasonText = reason ? `<div style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0;">
    <strong>Reason for Removal:</strong> ${reason}
  </div>` : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #c0392b;">Access Revoked</h2>
      <p>Hello ${username},</p>
      <p>Your admin access to the <strong>Secure Voting System</strong> has been revoked by the Head Admin.</p>
      ${reasonText}
      <p>You will no longer be able to log in to the admin dashboard.</p>
      <p>If you believe this is an error, please contact the Head Admin directly.</p>
    </div>
  `;
  return await sendEmail(email, username, subject, html);
};

// Send Vote Confirmation Email
const sendVoteConfirmationEmail = async (voterEmail, voterName, electionName) => {
  const subject = `Vote Confirmed - ${electionName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #27ae60;">Vote Cast Successfully!</h2>
      <p>Dear ${voterName},</p>
      <p>This email confirms that your vote for the election <strong>${electionName}</strong> has been successfully recorded.</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <span style="font-size: 48px;">✅</span>
        <h3 style="color: #2c3e50; margin: 10px 0;">Vote Secured</h3>
        <p style="color: #7f8c8d; margin: 0;">Your ballot has been encrypted and stored.</p>
      </div>
      <p>Thank you for participating.</p>
      <p>Best regards,<br>Secure Voting System</p>
    </div>
  `;
  return await sendEmail(voterEmail, voterName, subject, html);
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
  sendVoteConfirmationEmail,
  sendCandidateResultEmail
};
