module.exports = (sequelize, Sequelize) => {
    const EspacoAmenity = sequelize.define('espaco_amenity', {
        espacoId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'espacos',
                key: 'id'
            },
            primaryKey: true
        },
        amenityId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'amenities',
                key: 'id'
            },
            primaryKey: true
        }
    });

    return EspacoAmenity;
};