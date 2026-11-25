const { Op } = require('sequelize');
const User = require('../../models/User');
const { likeEscape } = require('../../utils/populate');

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
      const where = {};
      if (args.year) where.year = { [Op.iLike]: `%${likeEscape(args.year)}%` };
      if (args.studentClass) where.studentClass = { [Op.iLike]: `%${likeEscape(args.studentClass)}%` };
      if (args.section) where.section = { [Op.iLike]: `%${likeEscape(args.section)}%` };
      where.role = args.role || 'user';
      if (userContext?.collegeId) where.collegeId = userContext.collegeId;

      const users = await User.findAll({
        where,
        attributes: ['_id', 'name', 'username', 'year', 'studentClass', 'section'],
        limit: 100,
        raw: true
      });

      return {
        count: users.length,
        users: users
      };
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }
};
