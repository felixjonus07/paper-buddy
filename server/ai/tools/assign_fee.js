const StudentFee = require('../../models/StudentFee');
const Fee = require('../../models/Fee');
const User = require('../../models/User');

module.exports = {
  name: 'assign_fee',
  description: 'Assign an existing fee to all users in a specific group or to a list of specific users.',
  category: 'Fee Management',
  riskLevel: 'high',
  confirmationRequired: true, 
  permissions: ['admin'],
  dependencies: ['create_fee', 'search_users'], // Explicit dependencies hint for LLM Planner
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

      const fee = await Fee.findById(feeId);
      if (!fee) throw new Error(`Fee not found with ID ${feeId}`);

      let targetUserIds = [];
      if (groupId) {
        const usersInGroup = await User.find({ groups: groupId }).select('_id');
        targetUserIds = usersInGroup.map(u => u._id.toString());
      } else if (userIds && userIds.length > 0) {
        targetUserIds = userIds;
      }

      if (targetUserIds.length === 0) return { message: 'No users found.', assignedCount: 0 };

      const studentFeesToInsert = targetUserIds.map(uid => ({
        studentId: uid, groupId: groupId || null, feeId: fee._id,
        baseAmount: fee.amount, discountAmount: 0, finalAmount: fee.amount, status: 'PENDING'
      }));

      const result = await StudentFee.insertMany(studentFeesToInsert, { ordered: false });
      // Keep track of inserted IDs for rollback
      const insertedIds = result.map(doc => doc._id.toString());

      return { message: `Assigned fee to ${result.length} students.`, assignedCount: result.length, insertedIds };
    } catch (error) {
      throw new Error(`Failed to assign fee: ${error.message}`);
    }
  },
  rollbackHandler: async (args, result, userContext) => {
    console.log(`[assign_fee] Rolling back student fees assignment...`);
    if (result.insertedIds && result.insertedIds.length > 0) {
      // Physical delete for simplicity, could be soft delete based on preferences
      await StudentFee.deleteMany({ _id: { $in: result.insertedIds } });
    }
  }
};
