module.exports = (sequelize, Sequelize) => {
    const Espaco = sequelize.define('espaco', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true, 
            allowNull: false, 
            primaryKey: true
        },
        nome: {
            type: Sequelize.STRING, 
            allowNull: false
        },
        descricao: {
            type: Sequelize.TEXT
        },
        capacidade: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        localizacao: {
            type: Sequelize.STRING,
            allowNull: false
        },
        equipamentos: {
            type: Sequelize.TEXT // JSON string of available equipment
        },
        ativo: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    });

    Espaco.associate = (models) => {
        Espaco.belongsToMany(models.Amenity, { 
            through: 'espaco_amenities', 
            foreignKey: 'espacoId',
            otherKey: 'amenityId'
        });
    };

    return Espaco;
};