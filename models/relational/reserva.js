module.exports = (sequelize, Sequelize) => {
    const Reserva = sequelize.define('reserva', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true, 
            allowNull: false, 
            primaryKey: true
        },
        titulo: {
            type: Sequelize.STRING, 
            allowNull: false
        },
        dataInicio: {
            type: Sequelize.DATE, 
            allowNull: false
        },
        dataFim: {
            type: Sequelize.DATE, 
            allowNull: false
        },
        descricao: {
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.ENUM('confirmada', 'pendente', 'cancelada'),
            defaultValue: 'pendente'
        },
        usuarioId: {
            type: Sequelize.INTEGER, 
            allowNull: false
        },
        espacoId: {
            type: Sequelize.INTEGER, 
            allowNull: false
        }
    });
    return Reserva;
}