'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SpaceAmenity extends Model {
    static associate(models) {
      // define association here
      SpaceAmenity.belongsTo(models.Space, {
        foreignKey: 'spaceId',
        as: 'space',
        onDelete: 'RESTRICT', // Prevents deleting a Space if it has amenities linked
      });
      SpaceAmenity.belongsTo(models.Amenity, {
        foreignKey: 'amenityId',
        as: 'amenity',
        onDelete: 'RESTRICT', // Prevents deleting an Amenity if it's linked to a space
      });
    }
  }
  SpaceAmenity.init({
    spaceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    amenityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    }
  }, {
    sequelize,
    modelName: 'SpaceAmenity',
    tableName: 'space_amenities',
  });
  return SpaceAmenity;
};