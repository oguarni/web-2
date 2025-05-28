module.exports = (sequelize, Sequelize) => {
    const ReservaRecurso = sequelize.define('reserva_recurso', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        reservaId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'reservas',
                key: 'id'
            }
        },
        recursoId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'recursos',
                key: 'id'
            }
        },
        quantidade: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1
            }
        }
    }, {
        tableName: 'reserva_recursos'
    });

    return ReservaRecurso;
};
