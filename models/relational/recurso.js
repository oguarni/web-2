module.exports = (sequelize, Sequelize) => {
    const Recurso = sequelize.define('recurso', {
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
        quantidade: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    });
    return Recurso;
}