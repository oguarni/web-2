module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define('usuario', {
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
        login: {
            type: Sequelize.STRING, 
            allowNull: false,
            unique: true
        },
        senha: {
            type: Sequelize.STRING, 
            allowNull: false
        },
        tipo: {
            type: Sequelize.INTEGER, 
            allowNull: false,
            defaultValue: 2, // 1 = Admin, 2 = Usuário comum
            validate: {
                isIn: [[1, 2]]
            }
        }
    });
    return Usuario;
}