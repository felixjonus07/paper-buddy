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

      // Add groupId to the 'groups' array of each user
      const result = await User.updateMany(
        { _id: { $in: userIds } },
        { $addToSet: { groups: groupId } }
      );
      
      return { 
        message: 'Users assigned to group successfully', 
        modifiedCount: result.modifiedCount,
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
      await User.updateMany(
        { _id: { $in: result.userIdsAssigned } },
        { $pull: { groups: result.groupId } }
      );
    }
  }
};
