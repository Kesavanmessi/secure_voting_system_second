const crypto = require('crypto');
require('dotenv').config();

let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '3f9d2c7b59f7468a1e5b34c1a9f872db12fe6a89cc4e7b6a9d4528fc1234abcd'; // Your original key

// Ensure the key is exactly 32 bytes for AES-256
let keyBuffer = Buffer.from(ENCRYPTION_KEY, 'utf-8');
if (keyBuffer.length < 32) {
  // Pad the key if it's too short
  ENCRYPTION_KEY = Buffer.concat([keyBuffer, Buffer.alloc(32 - keyBuffer.length)]);  // Ensure 32 bytes
} else if (keyBuffer.length > 32) {
  // If the key is longer, trim it to 32 bytes
  ENCRYPTION_KEY = keyBuffer.slice(0, 32);
}

const IV_LENGTH = 16; // For AES, this is 16 bytes

function encryptVoteCount(count) {
  const iv = crypto.randomBytes(IV_LENGTH); // Generates a 16-byte IV
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(count.toString());
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptVoteCount(encryptedCount) {
  const [iv, encrypted] = encryptedCount.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return parseInt(decrypted.toString());
}
module.exports = { encryptVoteCount, decryptVoteCount };
