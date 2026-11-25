const { sequelize } = require('../config/db');
const { DataTypes, id, ref, refArray, createdAt } = require('./_columns');

const Scholarship = sequelize.define('scholarships', {
  ...id(),
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  discountPercentage: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: { min: 0, max: 100 },
  },
  applicableFeeTypes: refArray(), // UUID[] of FeeType._id
  minAcademicScore: { type: DataTypes.DOUBLE, defaultValue: 0 },
  collegeId: ref(false),
  ...createdAt(),
});

module.exports = Scholarship;
