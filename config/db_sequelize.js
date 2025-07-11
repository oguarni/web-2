require('dotenv').config(); // Garante que as variáveis do .env sejam carregadas
const { Sequelize } = require('sequelize');

// --- CORREÇÃO APLICADA AQUI ---
// Inicializa o Sequelize usando as variáveis de ambiente diretamente,
// em vez de usar o arquivo config.json que não processa as variáveis.
const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.POSTGRES_HOST, // O host deve ser 'postgres' para o Docker
        dialect: 'postgres',
        logging: false // Desativa os logs SQL no console para um output mais limpo
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importa os modelos
db.Usuario = require('../models/relational/usuario')(sequelize, Sequelize);
db.Espaco = require('../models/relational/espaco')(sequelize, Sequelize);
db.Amenity = require('../models/relational/amenity')(sequelize, Sequelize);
db.Reserva = require('../models/relational/reserva')(sequelize, Sequelize);
db.EspacoAmenity = require('../models/relational/espacoAmenity')(sequelize, Sequelize);

// --- Definição das Associações ---

// Relação 1:N - Utilizador pode ter várias Reservas
db.Usuario.hasMany(db.Reserva, { foreignKey: 'usuarioId', as: 'reservas' });
db.Reserva.belongsTo(db.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Relação 1:N - Espaço pode ter várias Reservas
db.Espaco.hasMany(db.Reserva, { foreignKey: 'espacoId', as: 'reservas' });
db.Reserva.belongsTo(db.Espaco, { foreignKey: 'espacoId', as: 'espaco' });

// Relação N:N - Espaços e Amenities através da tabela EspacoAmenity
db.Espaco.belongsToMany(db.Amenity, { through: db.EspacoAmenity, foreignKey: 'espacoId', as: 'amenities' });
db.Amenity.belongsToMany(db.Espaco, { through: db.EspacoAmenity, foreignKey: 'amenityId', as: 'espacos' });


// Função para conectar e sincronizar os modelos com o banco de dados
const connectAndSync = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso.');
        
        // Sincroniza os modelos. force: false para não apagar os dados existentes.
        await sequelize.sync({ force: false }); 
        console.log('✅ Todos os modelos foram sincronizados com sucesso.');
    } catch (error) {
        console.error('❌ Não foi possível conectar à base de dados:', error);
        // Lança o erro para que a função startApplication possa capturá-lo
        throw error;
    }
};

// Exporta a instância do sequelize, os modelos e a função de conexão
module.exports = {
    ...db,
    connectAndSync
};
