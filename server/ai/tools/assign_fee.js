const { Op } = require('sequelize');
const StudentFee = require('../../models/StudentFee');
const Fee = require('../../models/Fee');
const User = require('../../models/User');
const { isUUID } = require('../../utils/populate');

module.exports = {
  name: 'assign_fee',
  description: 'Assign an existing fee to all users in a specific group or to a list of specific users.',
  category: 'Fee Management',
  riskLevel: 'high',
  confirmationRequired: true,
  permissions: ['admin'],
  dependencies: ['create_fee', 'search_users'],
  inputSchema: {
    type: 'OBJECT',
    properties: {
      feeId: { type: 'STRING', description: 'The ID of the fee to assign' },
      groupId: { type: 'STRING', description: 'The ID of the group to assign the fee to' },
      userIds: { type: 'ARRAY', items: { type: 'STRING' } }
    },
    required: ['feeId']
  },
  outputSchema: { type: 'OBJECT' },
  executor: async (args, userContext) => {
    try {
      const { feeId, groupId, userIds } = args;

      if (!groupId && (!userIds || userIds.length === 0)) throw new Error("Must provide groupId or userIds");
      if (!isUUID(feeId)) throw new Error(`Invalid feeId ${feeId}`);

      const fee = await Fee.findByPk(feeId, { raw: true });
      if (!fee) throw new Error(`Fee not found with ID ${feeId}`);

      let targetUserIds = [];
      if (groupId) {
        if (!isUUID(groupId)) throw new Error(`Invalid groupId ${groupId}`);
        const usersInGroup = await User.findAll({
          where: { groups: { [Op.contains]: [groupId] } },
          attributes: ['_id'],
          raw: true
        });
        targetUserIds = usersInGroup.map(u => String(u._id));
      } else if (userIds && userIds.length > 0) {
        targetUserIds = userIds;
      }

      if (targetUserIds.length === 0) return { message: 'No users found.', assignedCount: 0 };

      const studentFeesToInsert = targetUserIds.map(uid => ({
        studentId: uid,
        groupId: groupId || null,
        feeId: fee._id,
        baseAmount: fee.amount,
        discountAmount: 0,
        finalAmount: fee.amount,
        status: 'PENDING',
        collegeId: userContext?.collegeId || fee.collegeId
      }));

      const result = await StudentFee.bulkCreate(studentFeesToInsert, { returning: true });
      const insertedIds = result.map(doc => String(doc._id));

      return { message: `Assigned fee to ${result.length} students.`, assignedCount: result.length, insertedIds };
    } catch (error) {
      throw new Error(`Failed to assign fee: ${error.message}`);
    }
  },
  rollbackHandler: async (args, result, userContext) => {
    console.log(`[assign_fee] Rolling back student fees assignment...`);
    if (result.insertedIds && result.insertedIds.length > 0) {
      await StudentFee.destroy({ where: { _id: { [Op.in]: result.insertedIds } } });
    }
  }
};
