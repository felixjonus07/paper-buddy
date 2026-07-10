const Group = require('../../models/Group');

module.exports = {
  name: 'create_group',
  description: 'Create a new group in the system to organize users.',
  category: 'Group Management',
  riskLevel: 'low',
  confirmationRequired: false,
  permissions: ['admin'],
  inputSchema: {
    type: 'OBJECT',
    properties: {
      name: { type: 'STRING', description: 'Name of the group, e.g., "3rd Year CSE"' },
      description: { type: 'STRING', description: 'Description of the group' }
    },
    required: ['name']
  },
  outputSchema: { type: 'OBJECT' },
  executor: async (args, userContext) => {
    try {
      let group = await Group.findOne({ name: args.name });
      if (group) return { message: 'Group already exists', groupId: group._id.toString(), existing: true };

      group = new Group({ name: args.name, description: args.description || `Group for ${args.name}` });
      await group.save();
      
      return { message: 'Group created successfully', groupId: group._id.toString(), existing: false };
    } catch (error) {
      throw new Error(`Failed to create group: ${error.message}`);
    }
  },
  rollbackHandler: async (args, result, userContext) => {
    console.log(`[create_group] Rolling back group creation...`);
    // Only delete if we actually created it (didn't exist before)
    if (!result.existing && result.groupId) {
      await Group.findByIdAndDelete(result.groupId);
    }
  }
};
