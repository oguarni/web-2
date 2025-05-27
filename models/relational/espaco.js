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
        tipo: {
            type: Sequelize.ENUM('sala', 'auditorio', 'quadra', 'coworking'),
            allowNull: false
        },
        ativo: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    });
    return Espaco;
}