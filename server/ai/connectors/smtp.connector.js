// Mock SMTP Connector
module.exports = {
  sendEmail: async (to, subject, html) => {
    console.log(`[SMTPConnector] Sending email to ${to}`);
    return true;
  }
};
