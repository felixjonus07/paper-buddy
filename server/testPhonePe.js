const axios = require('axios');
const crypto = require('crypto');

const PHONEPE_MERCHANT_ID = 'PGTESTPAYUAT86';
const PHONEPE_SALT_KEY = '96434309-7796-489d-8924-ab56988a6076';
const PHONEPE_SALT_INDEX = '1';
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

async function test() {
  const payload = {
    merchantId: PHONEPE_MERCHANT_ID,
    merchantTransactionId: 'TEST_' + Date.now(),
    merchantUserId: 'USER_123',
    amount: 1000,
    redirectUrl: 'http://localhost:5173/user/dashboard',
    redirectMode: 'REDIRECT',
    callbackUrl: 'http://localhost:5050/api/user/phonepe-callback',
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const checksum = crypto
    .createHash('sha256')
    .update(base64Payload + '/pg/v1/pay' + PHONEPE_SALT_KEY)
    .digest('hex') + '###' + PHONEPE_SALT_INDEX;

  try {
    const response = await axios.post(
      `${PHONEPE_BASE_URL}/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        }
      }
    );
    console.log('SUCCESS:', response.data);
  } catch (error) {
    console.log('ERROR:', error.response?.data || error.message);
  }
}

test();
