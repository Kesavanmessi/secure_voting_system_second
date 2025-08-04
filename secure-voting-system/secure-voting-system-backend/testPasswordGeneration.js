// Test script for random password generation

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const testPasswordGeneration = () => {
  console.log('Testing random password generation...');
  
  // Generate multiple passwords to ensure randomness
  for (let i = 1; i <= 5; i++) {
    const password = generateRandomPassword();
    console.log(`Password ${i}: ${password} (Length: ${password.length})`);
  }
  
  console.log('Password generation test completed!');
};

testPasswordGeneration(); 