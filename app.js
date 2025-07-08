// Importações necessárias
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./config/db_sequelize');
const connectMongo = require('./config/db_mongoose');
const webRoutes = require('./routers/web');
const apiRoutes = require('./routers/api');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Conectar ao MongoDB
connectMongo();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_default_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// --- Lógica para criar dados iniciais ---

const createDefaultUsers = async () => {
    try {
        const adminExists = await db.Usuario.findOne({ where: { login: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.Usuario.create({ nome: 'Administrador', login: 'admin', senha: hashedPassword, tipo: 1 });
        }

        const userExists = await db.Usuario.findOne({ where: { login: 'usuario' } });
        if (!userExists) {
            const hashedPassword = await bcrypt.hash('usuario123', 10);
            await db.Usuario.create({ nome: 'Usuário Comum', login: 'usuario', senha: hashedPassword, tipo: 2 });
        }

        const gestorExists = await db.Usuario.findOne({ where: { login: 'gestor' } });
        if (!gestorExists) {
            const hashedPassword = await bcrypt.hash('gestor123', 10);
            await db.Usuario.create({ nome: 'Gestor de Espaços', login: 'gestor', senha: hashedPassword, tipo: 3 });
        }
    } catch (error) {
        console.error('Erro ao criar utilizadores padrão:', error);
    }
};

const createSampleData = async () => {
    try {
        const amenitiesCount = await db.Amenity.count();
        let amenities;
        if (amenitiesCount === 0) {
            amenities = await db.Amenity.bulkCreate([
                { nome: 'WiFi', descricao: 'Internet sem fio de alta velocidade' },
                { nome: 'Projetor', descricao: 'Projetor para apresentações' },
                { nome: 'Ar Condicionado', descricao: 'Sistema de climatização' },
                { nome: 'Quadro Branco', descricao: 'Quadro para anotações' },
                { nome: 'Mesa de Reunião', descricao: 'Mesa grande para reuniões' }
            ]);
        } else {
            amenities = await db.Amenity.findAll();
        }

        const espacosCount = await db.Espaco.count();
        if (espacosCount === 0) {
            const espacos = await db.Espaco.bulkCreate([
                { nome: 'Sala de Reunião A', descricao: 'Pequena sala para até 6 pessoas', capacidade: 6, localizacao: 'Térreo', ativo: true },
                { nome: 'Auditório', descricao: 'Espaço para apresentações', capacidade: 50, localizacao: '1º Andar', ativo: true },
                { nome: 'Sala de Treinamento', descricao: 'Sala para treinamentos', capacidade: 20, localizacao: '2º Andar', ativo: true }
            ]);
            await espacos[0].addAmenities([amenities[0], amenities[1], amenities[2]]);
            await espacos[1].addAmenities([amenities[0], amenities[1], amenities[2], amenities[3], amenities[4]]);
            await espacos[2].addAmenities([amenities[0], amenities[1], amenities[3], amenities[4]]);
        }
    } catch (error) {
        console.error('Erro ao criar dados de exemplo:', error);
    }
};

// --- Fim da lógica de dados iniciais ---

// Rotas
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// Servir o frontend React em produção
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 8081;

const startApplication = async () => {
    try {
        await db.createDatabaseIfNotExists();
        await db.connectAndSync();

        // --- CORREÇÃO APLICADA AQUI ---
        // Agora, estas funções são chamadas sempre que a aplicação inicia.
        // Como elas verificam se os dados já existem, é seguro executá-las sempre.
        await createDefaultUsers();
        await createSampleData();

        app.listen(PORT, () => {
            // Mensagens de sucesso podem ser úteis para depuração
            // console.log(`✅ Servidor rodando com sucesso na porta ${PORT}`);
        });

    } catch (error) {
        console.error('❌ Falha ao iniciar a aplicação:', error);
        process.exit(1);
    }
};

startApplication();