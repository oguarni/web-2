const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const apiRoutes = require('./routers/api');
const app = express();

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Rotas da API
app.use('/api', apiRoutes);

// Rota raiz para documentação
app.get('/', (req, res) => {
    res.json({
        message: 'Sistema de Reservas de Espaços - API REST',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: '/api'
    });
});

// Iniciar servidor
app.listen(8081, function(){
    console.log("Servidor no http://localhost:8081");
});