const Sequelize = require('sequelize');
const { Client } = require('pg');

// Configuração do banco de dados
const DB_CONFIG = {
    database: process.env.DB_NAME || 'web2_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '1234',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
};

// Função para criar o banco de dados se não existir
const createDatabaseIfNotExists = async () => {
    const client = new Client({
        host: DB_CONFIG.host,
        port: DB_CONFIG.port,
        user: DB_CONFIG.username,
        password: DB_CONFIG.password,
        database: 'postgres' // conecta ao banco padrão postgres
    });

    try {
        await client.connect();
        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = '${DB_CONFIG.database}'`
        );
        
        if (result.rows.length === 0) {
            await client.query(`CREATE DATABASE "${DB_CONFIG.database}"`);
            console.log(`Database ${DB_CONFIG.database} created successfully`);
        } else {
            console.log(`Database ${DB_CONFIG.database} already exists`);
        }
    } catch (error) {
        console.error('Error creating database:', error.message);
        throw error;
    } finally {
        await client.end();
    }
};

// Cria a instância do Sequelize
const sequelize = new Sequelize(DB_CONFIG.database, DB_CONFIG.username, DB_CONFIG.password, DB_CONFIG);

var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.createDatabaseIfNotExists = createDatabaseIfNotExists;

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