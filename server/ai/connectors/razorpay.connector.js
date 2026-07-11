// Mock Razorpay Connector
module.exports = {
  createPaymentLink: async (amount, description, customer) => {
    console.log(`[RazorpayConnector] Creating link for ${amount}`);
    return `https://rzp.io/mock/${Date.now()}`;
  }
};
