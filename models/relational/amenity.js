module.exports = (sequelize, Sequelize) => {
    const Amenity = sequelize.define('amenity', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        nome: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        descricao: {
            type: Sequelize.TEXT
        }
    });

    Amenity.associate = (models) => {
        Amenity.belongsToMany(models.Espaco, { 
            through: 'espaco_amenities', 
            foreignKey: 'amenityId',
            otherKey: 'espacoId'
        });
    };

    return Amenity;
};