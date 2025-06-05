const Sequelize = require('sequelize');
const sequelize = new Sequelize('web2_db', 'postgres', '1234', {
    host: 'localhost',
    dialect: 'postgres'
});

var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import relational models
db.Usuario = require('../models/relational/usuario.js')(sequelize, Sequelize);
db.Reserva = require('../models/relational/reserva.js')(sequelize, Sequelize);
db.Espaco = require('../models/relational/espaco.js')(sequelize, Sequelize);

// Define relationships
db.Usuario.hasMany(db.Reserva, { foreignKey: 'usuarioId', onDelete: 'NO ACTION' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'usuarioId' });

db.Espaco.hasMany(db.Reserva, { foreignKey: 'espacoId', onDelete: 'NO ACTION' });
db.Reserva.belongsTo(db.Espaco, { foreignKey: 'espacoId' });

module.exports = db;