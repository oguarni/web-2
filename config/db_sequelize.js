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
db.Amenity = require('../models/relational/amenity.js')(sequelize, Sequelize);
db.EspacoAmenity = require('../models/relational/espacoAmenity.js')(sequelize, Sequelize);

// Define relationships
db.Usuario.hasMany(db.Reserva, { foreignKey: 'usuarioId', onDelete: 'NO ACTION' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'usuarioId' });

db.Espaco.hasMany(db.Reserva, { foreignKey: 'espacoId', onDelete: 'NO ACTION' });
db.Reserva.belongsTo(db.Espaco, { foreignKey: 'espacoId' });

// Many-to-many relationship between Espaco and Amenity
db.Espaco.belongsToMany(db.Amenity, { 
    through: db.EspacoAmenity, 
    foreignKey: 'espacoId',
    otherKey: 'amenityId'
});
db.Amenity.belongsToMany(db.Espaco, { 
    through: db.EspacoAmenity, 
    foreignKey: 'amenityId',
    otherKey: 'espacoId'
});

// Direct associations for EspacoAmenity
db.EspacoAmenity.belongsTo(db.Espaco, { foreignKey: 'espacoId' });
db.EspacoAmenity.belongsTo(db.Amenity, { foreignKey: 'amenityId' });
db.Espaco.hasMany(db.EspacoAmenity, { foreignKey: 'espacoId' });
db.Amenity.hasMany(db.EspacoAmenity, { foreignKey: 'amenityId' });

module.exports = db;