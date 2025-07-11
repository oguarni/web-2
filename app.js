
// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Adicionado
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const webRoutes = require('./routers/web');
const apiRoutes = require('./routers/api');
const { errorHandler } = require('./middlewares/errorHandler');
const { sanitizeInput } = require('./middlewares/sanitization');
const db = require('./config/db_sequelize');
require('./config/db_mongoose');

const app = express(); // Apenas uma declaração

// Make database available to all routes
app.set('db', db);

// --- Middlewares Principais ---

// 1. CORS: Deve vir antes das rotas.
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

// 2. Parsers para JSON e URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JSON parsing error handler
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON format',
            code: 'INVALID_JSON'
        });
    }
    next(err);
});

// 3. Input sanitization for XSS protection
app.use(sanitizeInput);

// 4. Rate limiting middleware
// Strategy: Multi-tier rate limiting for enhanced security against brute force attacks and API abuse

// Strict rate limiter for authentication endpoints
// Purpose: Prevent brute force login attacks by limiting to 5 attempts per 15 minutes
// Only failed login attempts count towards the limit (skipSuccessfulRequests: true)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again later.'
        });
    }
});

// General API rate limiter
// Purpose: Prevent API abuse and ensure fair usage across all endpoints
// Allows higher volume (100 requests per 15 minutes) for legitimate application usage
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many API requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many API requests, please try again later.'
        });
    }
});

// Apply strict rate limiting to authentication endpoints
app.use('/api/auth/login', authLimiter);

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter);

// 5. Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// 6. Configuração do flash para mensagens
app.use(flash());

// --- Configuração de Views e Arquivos Estáticos ---

// View Engine (Handlebars)
const hbs = require('hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register handlebars partials and layouts
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.localsAsTemplateData(app);

// Register handlebars helpers
hbs.registerHelper('tipoUsuario', function(tipo) {
    switch(tipo) {
        case 1: return 'Admin';
        case 2: return 'Usuário';
        case 3: return 'Gestor';
        default: return 'Usuário';
    }
});

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

hbs.registerHelper('formatDateTime', function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR');
});

// Servir arquivos estáticos (CSS, imagens) para a aplicação MVC
app.use('/public', express.static(path.join(__dirname, 'public')));

// Servir os arquivos estáticos da build do React
app.use(express.static(path.join(__dirname, 'client/build')));

// --- Rotas ---

// Rotas da API
app.use('/api', apiRoutes);

// Rotas da aplicação Web (MVC)
app.use('/web', webRoutes);

// Rota para a documentação da API (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redirects for legacy routes
app.use('/reservas', (req, res) => {
    res.redirect('/web/reservas' + req.url);
});

app.use('/espacos', (req, res) => {
    res.redirect('/web/espacos' + req.url);
});

app.use('/usuarios', (req, res) => {
    res.redirect('/web/usuarios' + req.url);
});

// Rota Catch-all para o React
app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/web')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// --- Tratamento de Erros ---
app.use(errorHandler);

// --- Inicialização do Servidor ---

const PORT = process.env.PORT || 8081;

const createDefaultUsers = async () => {
    try {
        const adminExists = await db.User.findOne({ where: { login: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.User.create({ name: 'Administrador', login: 'admin', password: hashedPassword, type: 1 });
            console.log('--> Usuário "admin" criado com sucesso.');
        }

        const userExists = await db.User.findOne({ where: { login: 'usuario' } });
        if (!userExists) {
            const hashedPassword = await bcrypt.hash('usuario123', 10);
            await db.User.create({ name: 'Usuário Comum', login: 'usuario', password: hashedPassword, type: 2 });
            console.log('--> Usuário "usuario" criado com sucesso.');
        }

        const gestorExists = await db.User.findOne({ where: { login: 'gestor' } });
        if (!gestorExists) {
            const hashedPassword = await bcrypt.hash('gestor123', 10);
            await db.User.create({ name: 'Gestor de Espaços', login: 'gestor', password: hashedPassword, type: 3 });
            console.log('--> Usuário "gestor" criado com sucesso.');
        }
    } catch (error) {
        console.error('Erro ao criar utilizadores padrão:', error);
    }
};

db.sequelize.sync().then(async () => {
    console.log('Banco de dados sincronizado.');
    await createDefaultUsers();
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
