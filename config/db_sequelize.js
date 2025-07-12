require('dotenv').config(); // Ensures .env variables are loaded
const { Sequelize } = require('sequelize');

// Initialize Sequelize using environment variables directly,
// instead of using config.json that doesn't process variables.
const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.POSTGRES_HOST, // Host should be 'postgres' for Docker
        dialect: 'postgres',
        logging: false // Disable SQL logs in console for cleaner output
    }
);

// Initialize models using the central index file
const initializeModels = require('../models/relational/index');
const models = initializeModels(sequelize);

const db = {
  Sequelize,
  sequelize,
  ...models
};


// Function to connect and synchronize models with the database
const connectAndSync = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connection established successfully.');
        
        // Synchronize models. force: false to avoid deleting existing data.
        await sequelize.sync({ force: false }); 
        console.log('✅ All models synchronized successfully.');
    } catch (error) {
        console.error('❌ Could not connect to database:', error);
        // Throw error so startApplication function can catch it
        throw error;
    }
};

// Export sequelize instance, models and connection function
module.exports = {
    ...db,
    connectAndSync
};
