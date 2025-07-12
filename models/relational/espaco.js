'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Space extends Model {
    static associate(models) {
      // Define associations here
      Space.hasMany(models.Reservation, {
        foreignKey: 'spaceId',
        as: 'reservations',
        onDelete: 'RESTRICT'
      });
      Space.belongsToMany(models.Amenity, { 
        through: models.SpaceAmenity, 
        foreignKey: 'spaceId',
        otherKey: 'amenityId',
        as: 'amenities'
      });
    }
  }
  Space.init({
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
    description: {
      type: DataTypes.TEXT
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    equipment: {
      type: DataTypes.TEXT // JSON string of available equipment
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      indexes: [{ fields: ['active'] }]
    }
  }, {
    sequelize,
    modelName: 'Space',
    tableName: 'spaces'
  });
  return Space;
};