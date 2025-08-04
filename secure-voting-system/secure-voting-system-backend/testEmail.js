const { sendElectionCreationEmail, sendOTPEmail, generateOTP } = require('./utils/emailService');

// Test email functionality
const testEmailSystem = async () => {
  console.log('Testing email system...');
  
  try {
    // Test OTP generation
    const otp = generateOTP();
    console.log('Generated OTP:', otp);
    
    // Test sending OTP email
    await sendOTPEmail('test@example.com', 'Test Voter', otp); // Replace with your test email
    
    // Test sending election creation email
    await sendElectionCreationEmail('test@example.com', 'Test Voter', 'Test Election 2024', 'voter123', 'TestPass123!'); // Replace with your test email
    
    console.log('Email system test completed successfully!');
  } catch (error) {
    console.error('Email system test failed:', error);
  }
};

// Run the test
testEmailSystem(); 