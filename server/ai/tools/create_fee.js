const { Op } = require('sequelize');
const Fee = require('../../models/Fee');
const FeeType = require('../../models/FeeType');
const { likeEscape } = require('../../utils/populate');

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
      const collegeId = userContext?.collegeId;
      const whereType = { name: { [Op.iLike]: likeEscape(args.typeName) } };
      if (collegeId) whereType.collegeId = collegeId;

      let feeType = await FeeType.findOne({ where: whereType });
      let feeTypeCreated = false;

      if (!feeType) {
        feeType = await FeeType.create({
          name: args.typeName,
          description: `Auto-created fee type: ${args.typeName}`,
          collegeId
        });
        feeTypeCreated = true;
      }

      const newFee = await Fee.create({
        title: args.title,
        amount: args.amount,
        feeType: feeType._id,
        collegeId
      });

      return {
        message: 'Fee created successfully',
        feeId: String(newFee._id),
        feeTypeId: feeTypeCreated ? String(feeType._id) : null
      };
    } catch (error) {
      throw new Error(`Failed to create fee: ${error.message}`);
    }
  },
  rollbackHandler: async (args, result, userContext) => {
    console.log(`[create_fee] Rolling back fee creation: ${result.feeId}`);
    if (result.feeId) await Fee.destroy({ where: { _id: result.feeId } });
    if (result.feeTypeId) await FeeType.destroy({ where: { _id: result.feeTypeId } });
  }
};
