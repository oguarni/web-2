const mongoose = require('mongoose');

const StringCon = {
    connection: process.env.MONGODB_URI || "mongodb://localhost:27017/reservas_db"
};

// Configuração de conexão com MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(StringCon.connection, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Fallback para localhost se MongoDB Atlas falhar
        if (StringCon.connection.includes('mongodb.net')) {
            console.log('Tentando conectar com localhost...');
            try {
                const localConn = await mongoose.connect("mongodb://localhost:27017/reservas_db", {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                });
                console.log('MongoDB Local Connected');
                return localConn;
            } catch (localError) {
                console.error('Local MongoDB connection error:', localError);
                throw localError;
            }
        }
        throw error;
    }
};

module.exports = {
    StringCon,
    connectDB
};