
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'USERS',
    timestamps: true,
  }
);

module.exports = User;
