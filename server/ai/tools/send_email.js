module.exports = {
  name: 'send_email',
  description: 'Send automated reminder emails containing information or payment links to users.',
  category: 'Communications',
  riskLevel: 'low',
  confirmationRequired: false,
  permissions: ['admin'],
  dependencies: ['generate_payment_links'],
  inputSchema: {
    type: 'OBJECT',
    properties: {
      targetAudience: { type: 'STRING' },
      subject: { type: 'STRING' },
      content: { type: 'STRING' }
    },
    required: ['targetAudience', 'subject']
  },
  outputSchema: { type: 'OBJECT' },
  executor: async (args, userContext) => {
    try {
      console.log(`[send_email] Sending email to: ${args.targetAudience}`);
      // Mock implementation
      return { message: 'Emails dispatched successfully', emailsSent: 42 };
    } catch (error) {
      throw new Error(`Failed to send emails: ${error.message}`);
    }
  },
  // Note: Emails cannot usually be unsent. We leave canRollback false implicitly because there is no rollbackHandler here.
};
