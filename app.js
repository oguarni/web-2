const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const apiRoutes = require('./routers/api');
const webRoutes = require('./routers/web');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { addUserToViews } = require('./middlewares/webAuth');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// View engine setup
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: (a, b) => a === b,
        ne: (a, b) => a !== b,
        gt: (a, b) => a > b,
        lt: (a, b) => a < b,
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        formatDate: (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString('pt-BR');
        },
        formatDateTime: (date) => {
            if (!date) return '';
            return new Date(date).toLocaleString('pt-BR');
        },
        capitalize: (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '',
        statusBadge: (status) => {
            const badges = {
                'confirmada': 'success',
                'pendente': 'warning',
                'cancelada': 'danger'
            };
            return badges[status] || 'secondary';
        },
        tipoUsuario: (tipo) => {
            const tipos = {
                1: 'Administrador',
                2: 'Usuário Comum',
                3: 'Gestor'
            };
            return tipos[tipo] || 'Desconhecido';
        },
        formatISO: (date) => {
            if (!date) return '';
            return new Date(date).toISOString().slice(0, 16);
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// Method override for PUT and DELETE
app.use(methodOverride('_method'));

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Add user to views
app.use(addUserToViews);

// Flash messages middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// CORS para permitir acesso de outras origens
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Sistema de Reservas - API Docs"
}));

// Web routes
app.use('/', webRoutes);

// Rotas da API
app.use('/api', apiRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 8082;
app.listen(PORT, function(){
    console.log(`Servidor no http://localhost:${PORT}`);
});