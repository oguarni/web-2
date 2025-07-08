require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs'); // Adicionado para criptografar senhas
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const webRoutes = require('./routers/web');
const apiRoutes = require('./routers/api');
const { errorHandler } = require('./middlewares/errorHandler');
const db = require('./config/db_sequelize'); // Modificado para importar todo o objeto db
require('./config/db_mongoose');

const app = express();

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Middlewares para parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do View Engine (Handlebars)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Servir arquivos estáticos (CSS, imagens) para a aplicação MVC a partir do diretório 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir os arquivos estáticos da build do React
app.use(express.static(path.join(__dirname, 'client/build')));

// Rotas da API
app.use('/api', apiRoutes);

// Rotas da aplicação Web (MVC)
app.use('/web', webRoutes);

// Rota para a documentação da API (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota Catch-all: Para qualquer outra requisição que não seja para a API ou MVC,
// sirva o arquivo principal da aplicação React.
app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/web')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 8081;

// --- Lógica para criar usuários padrão ---
const createDefaultUsers = async () => {
    try {
        const adminExists = await db.Usuario.findOne({ where: { login: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.Usuario.create({ nome: 'Administrador', login: 'admin', senha: hashedPassword, tipo: 1 });
            console.log('--> Usuário "admin" criado com sucesso.');
        }

        const userExists = await db.Usuario.findOne({ where: { login: 'usuario' } });
        if (!userExists) {
            const hashedPassword = await bcrypt.hash('usuario123', 10);
            await db.Usuario.create({ nome: 'Usuário Comum', login: 'usuario', senha: hashedPassword, tipo: 2 });
            console.log('--> Usuário "usuario" criado com sucesso.');
        }

        const gestorExists = await db.Usuario.findOne({ where: { login: 'gestor' } });
        if (!gestorExists) {
            const hashedPassword = await bcrypt.hash('gestor123', 10);
            await db.Usuario.create({ nome: 'Gestor de Espaços', login: 'gestor', senha: hashedPassword, tipo: 3 });
            console.log('--> Usuário "gestor" criado com sucesso.');
        }
    } catch (error) {
        console.error('Erro ao criar utilizadores padrão:', error);
    }
};

// Sincroniza o Sequelize, cria os usuários e inicia o servidor
db.sequelize.sync().then(async () => {
    console.log('Banco de dados sincronizado.');
    await createDefaultUsers(); // Garante que os usuários existam
    app.listen(PORT, () => {
        console.log(`Servidor unificado rodando na porta ${PORT}`);
        console.log(`--> Aplicação React (SPA) disponível em http://localhost:${PORT}`);
        console.log(`--> Aplicação MVC disponível em http://localhost:${PORT}/web`);
        console.log(`--> Documentação da API disponível em http://localhost:${PORT}/api-docs`);
    });
}).catch(err => {
    console.error('Não foi possível conectar ao banco de dados:', err);
});

module.exports = app;