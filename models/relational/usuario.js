'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
      User.hasMany(models.Reservation, {
        foreignKey: 'userId',
        as: 'reservations',
        onDelete: 'RESTRICT'
      });
    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, 
      allowNull: false, 
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    login: {
      type: DataTypes.STRING, 
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    type: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      defaultValue: 2, // 1 = Admin, 2 = Regular User, 3 = Manager
      validate: {
        isIn: [[1, 2, 3]]
      },
      indexes: [{ fields: ['type'] }]
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users'
  });
  return User;
};