'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    static associate(models) {
      // Define associations here
      Reservation.belongsTo(models.Space, {
        foreignKey: 'spaceId',
        as: 'space',
        onDelete: 'RESTRICT', // Prevents deleting a Space if it has reservations
      });
      Reservation.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'RESTRICT', // Prevents deleting a User if they have reservations
      });
    }
  }
  Reservation.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    spaceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Reservation',
    tableName: 'reservations'
  });
  return Reservation;
};