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
      let group = await Group.findOne({ where: { name: args.name }, raw: true });
      if (group) return { message: 'Group already exists', groupId: String(group._id), existing: true };

      group = await Group.create({
        name: args.name,
        description: args.description || `Group for ${args.name}`,
        collegeId: userContext?.collegeId
      });

      return { message: 'Group created successfully', groupId: String(group._id), existing: false };
    } catch (error) {
      throw new Error(`Failed to create group: ${error.message}`);
    }
  },
  rollbackHandler: async (args, result, userContext) => {
    console.log(`[create_group] Rolling back group creation...`);
    if (!result.existing && result.groupId) {
      await Group.destroy({ where: { _id: result.groupId } });
    }
  }
};
