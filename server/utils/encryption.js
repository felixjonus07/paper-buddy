const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY;
const IV_LENGTH = 16; // For AES, this is always 16

const encrypt = (text) => {
  if (!text) return text;
  
  // Ensure the key exists and is exactly 32 bytes (64 hex chars)
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('Invalid CREDENTIALS_ENCRYPTION_KEY. Must be 64 hex characters.');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
};

const decrypt = (encryptedObj) => {
  if (!encryptedObj || !encryptedObj.iv || !encryptedObj.encryptedData) return encryptedObj;
  
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('Invalid CREDENTIALS_ENCRYPTION_KEY. Must be 64 hex characters.');
  }

  const ivBuffer = Buffer.from(encryptedObj.iv, 'hex');
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
  
  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = { encrypt, decrypt };
