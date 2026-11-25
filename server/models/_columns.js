const { DataTypes } = require('sequelize');

/**
 * Shared column helpers so every table uses a UUID primary key called `_id`.
 * Keeping the name `_id` means the React client (which reads `item._id`)
 * keeps working exactly as it did with MongoDB.
 */
const id = () => ({
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
});

const ref = (allowNull = true) => ({ type: DataTypes.UUID, allowNull });

const refArray = () => ({
  type: DataTypes.ARRAY(DataTypes.UUID),
  allowNull: false,
  defaultValue: [],
});

const createdAt = () => ({
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = { DataTypes, id, ref, refArray, createdAt };
