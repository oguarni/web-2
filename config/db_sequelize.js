const Sequelize = require('sequelize');
const sequelize = new Sequelize('web2_db', 'postgres', '1234', {
    host: 'localhost',
    dialect: 'postgres'
});

var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importação dos modelos
db.Usuario = require('../models/relational/usuario.js')(sequelize, Sequelize);
db.Espaco = require('../models/relational/espaco.js')(sequelize, Sequelize);
db.Reserva = require('../models/relational/reserva.js')(sequelize, Sequelize);
db.Recurso = require('../models/relational/recurso.js')(sequelize, Sequelize);
db.ReservaRecurso = require('../models/relational/reservaRecurso.js')(sequelize, Sequelize);

// Relacionamentos 1:N
db.Usuario.hasMany(db.Reserva, { foreignKey: 'usuarioId', onDelete: 'NO ACTION' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'usuarioId' });

db.Espaco.hasMany(db.Reserva, { foreignKey: 'espacoId', onDelete: 'NO ACTION' });
db.Reserva.belongsTo(db.Espaco, { foreignKey: 'espacoId' });

// Relacionamento N:N (Reserva ↔ Recurso)
db.Reserva.belongsToMany(db.Recurso, { 
    through: db.ReservaRecurso, 
    foreignKey: 'reservaId',
    otherKey: 'recursoId',
    as: 'recursos'
});
db.Recurso.belongsToMany(db.Reserva, { 
    through: db.ReservaRecurso, 
    foreignKey: 'recursoId',
    otherKey: 'reservaId',
    as: 'reservas'
});

module.exports = db;