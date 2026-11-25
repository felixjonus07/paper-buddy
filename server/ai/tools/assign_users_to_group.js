const { Op, fn, col } = require('sequelize');
const User = require('../../models/User');

module.exports = {
  name: 'assign_users_to_group',
  description: 'Bulk assign a list of user IDs to a specific group ID.',
  category: 'Group Management',
  riskLevel: 'medium',
  confirmationRequired: false,
  permissions: ['admin'],
  dependencies: ['search_users', 'create_group'],
  inputSchema: {
    type: 'OBJECT',
    properties: {
      userIds: { type: 'ARRAY', items: { type: 'STRING' } },
      groupId: { type: 'STRING' }
    },
    required: ['userIds', 'groupId']
  },
  outputSchema: { type: 'OBJECT' },
  executor: async (args, userContext) => {
    try {
      const { userIds, groupId } = args;
      if (!userIds || !userIds.length) throw new Error('No user IDs provided.');

      const users = await User.findAll({ where: { _id: { [Op.in]: userIds } } });
      let modifiedCount = 0;
      for (const u of users) {
        const current = u.groups || [];
        if (!current.some(id => String(id) === String(groupId))) {
          u.groups = [...current, groupId];
          await u.save();
          modifiedCount++;
        }
      }

      return {
        message: 'Users assigned to group successfully',
        modifiedCount,
        userIdsAssigned: userIds,
        groupId
      };
    } catch (error) {
      throw new Error(`Failed to assign users to group: ${error.message}`);
    }
  },
  rollbackHandler: async (args, result, userContext) => {
    console.log(`[assign_users_to_group] Rolling back user assignments...`);
    if (result.userIdsAssigned && result.groupId) {
      await User.update(
        { groups: fn('array_remove', col('groups'), result.groupId) },
        { where: { _id: { [Op.in]: result.userIdsAssigned } } }
      );
    }
  }
};
