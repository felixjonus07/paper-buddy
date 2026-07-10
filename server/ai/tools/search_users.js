const User = require('../../models/User');

module.exports = {
  name: 'search_users',
  description: 'Search for users/students based on specific criteria like year, section, studentClass, role.',
  category: 'User Management',
  riskLevel: 'low',
  confirmationRequired: false,
  permissions: ['admin'],
  inputSchema: {
    type: 'OBJECT',
    properties: {
      year: { type: 'STRING', description: 'Academic year, e.g., "3", "Third Year"' },
      studentClass: { type: 'STRING', description: 'Department or Class, e.g., "CSE", "B.Tech CSE"' },
      section: { type: 'STRING', description: 'Section, e.g., "A", "B"' },
      role: { type: 'STRING', description: 'User role, typically "user" for students' }
    }
  },
  outputSchema: {
    type: 'OBJECT'
  },
  executor: async (args, userContext) => {
    try {
      const query = {};
      if (args.year) query.year = { $regex: args.year, $options: 'i' };
      if (args.studentClass) query.studentClass = { $regex: args.studentClass, $options: 'i' };
      if (args.section) query.section = { $regex: args.section, $options: 'i' };
      if (args.role) query.role = args.role;

      // Only search for students ('user' role) by default if role is not specified
      if (!args.role) query.role = 'user';

      const users = await User.find(query).select('_id name username year studentClass section').limit(100);
      
      return {
        count: users.length,
        users: users
      };
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }
};
