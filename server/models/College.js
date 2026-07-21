const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  subscriptionStatus: { type: String, enum: ['active', 'suspended'], default: 'active' },
  paymentType: { type: String, enum: ['CENTRALIZED', 'DECENTRALIZED'], default: 'CENTRALIZED' },
  paymentCredentials: {
    merchantId: { type: String }, // PhonePe Merchant ID
    saltKey: {
      iv: { type: String },
      encryptedData: { type: String }
    }, // PhonePe Salt Key (Encrypted)
    saltIndex: { type: Number, default: 1 },
    env: { type: String, enum: ['SANDBOX', 'PRODUCTION'], default: 'SANDBOX' }
  },
  aiAccess: { type: Boolean, default: true },
  promptCount: { type: Number, default: 0 },
  tokenCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('College', collegeSchema);
