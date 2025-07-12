'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Amenity extends Model {
    static associate(models) {
      // Define associations here
      Amenity.belongsToMany(models.Space, { 
        through: models.SpaceAmenity, 
        foreignKey: 'amenityId',
        otherKey: 'spaceId',
        as: 'spaces'
      });
    }
  }
  Amenity.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Amenity',
    tableName: 'amenities'
  });
  return Amenity;
};