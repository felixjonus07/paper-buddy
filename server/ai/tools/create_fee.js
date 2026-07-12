const Fee = require('../../models/Fee');
const FeeType = require('../../models/FeeType');

module.exports = {
  name: 'create_fee',
  description: 'Create a new Fee template (e.g., Hostel Fee) in the system.',
  category: 'Fee Management',
  riskLevel: 'medium',
  confirmationRequired: false,
  permissions: ['admin'],
  inputSchema: {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: 'Name/Title of the fee, e.g., "Hostel Fee"' },
      amount: { type: 'NUMBER', description: 'Amount of the fee in rupees' },
      typeName: { type: 'STRING', description: 'Category or type of fee, e.g., "Tuition", "Hostel"' }
    },
    required: ['title', 'amount', 'typeName']
  },
  outputSchema: { type: 'OBJECT' },
  executor: async (args, userContext) => {
    try {
      let feeType = await FeeType.findOne({ name: { $regex: new RegExp(`^${args.typeName}$`, 'i') } });
      let feeTypeCreated = false;
      
      if (!feeType) {
        feeType = new FeeType({ name: args.typeName, description: `Auto-created fee type: ${args.typeName}` });
        await feeType.save();
        feeTypeCreated = true;
      }

      const newFee = new Fee({ title: args.title, amount: args.amount, feeType: feeType._id });
      await newFee.save();
      
      return { 
        message: 'Fee created successfully', 
        feeId: newFee._id.toString(),
        feeTypeId: feeTypeCreated ? feeType._id.toString() : null // Used for rollback
      };
    } catch (error) {
      throw new Error(`Failed to create fee: ${error.message}`);
    }
  },
  rollbackHandler: async (args, result, userContext) => {
    console.log(`[create_fee] Rolling back fee creation: ${result.feeId}`);
    if (result.feeId) await Fee.findByIdAndDelete(result.feeId);
    if (result.feeTypeId) await FeeType.findByIdAndDelete(result.feeTypeId);
  }
};
