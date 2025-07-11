const mongoose = require('mongoose');

const StringCon = {
    connection: process.env.MONGODB_URI || "mongodb://localhost:27017/web2_logs"
};

// Configuração robusta de conexão com MongoDB com retry exponencial
const connectDB = async (retryCount = 0) => {
    const maxRetries = 5;
    const baseDelay = 1000; // 1 segundo
    
    // Configurações de conexão otimizadas
    const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000, // Aumentado para 30s
        socketTimeoutMS: 45000,
        family: 4, // Força IPv4
        connectTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true
    };

    const attemptConnection = async (uri, options) => {
        try {
            const conn = await mongoose.connect(uri, options);
            
            // Configurar event listeners para monitoramento
            mongoose.connection.on('connected', () => {
                console.log(`MongoDB connected successfully to: ${uri}`);
            });
            
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
            });
            
            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
            });
            
            // Graceful shutdown
            process.on('SIGINT', async () => {
                await mongoose.connection.close();
                console.log('MongoDB connection closed due to app termination');
                process.exit(0);
            });
            
            return conn;
        } catch (error) {
            throw error;
        }
    };

    try {
        // Tentar conectar com a URI principal
        return await attemptConnection(StringCon.connection, connectionOptions);
    } catch (error) {
        console.error(`MongoDB connection attempt ${retryCount + 1} failed:`, error.message);
        
        // Se for Atlas e falhar, tentar localhost como fallback
        if (StringCon.connection.includes('mongodb.net') && retryCount === 0) {
            console.log('Attempting fallback to localhost...');
            try {
                return await attemptConnection("mongodb://localhost:27017/reservas_db", connectionOptions);
            } catch (localError) {
                console.error('Local MongoDB fallback failed:', localError.message);
            }
        }
        
        // Implementar retry com backoff exponencial
        if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000; // Jitter
            console.log(`Retrying in ${Math.round(delay)}ms... (${retryCount + 1}/${maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return connectDB(retryCount + 1);
        }
        
        // Após esgotar todas as tentativas
        console.error('MongoDB connection failed after all retry attempts');
        throw new Error(`MongoDB connection failed after ${maxRetries} attempts: ${error.message}`);
    }
};

// Função para verificar se a conexão está ativa
const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

// Função para reconectar se necessário
const ensureConnection = async () => {
    if (!isConnected()) {
        console.log('MongoDB disconnected, attempting to reconnect...');
        return await connectDB();
    }
    return mongoose.connection;
};

module.exports = {
    StringCon,
    connectDB,
    isConnected,
    ensureConnection
};