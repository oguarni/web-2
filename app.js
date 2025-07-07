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
const db = require('./config/db_sequelize');
const { connectDB } = require('./config/db_mongoose');
const bcrypt = require('bcryptjs');

const app = express();

// Função para verificar se tabelas existem
const checkTablesExist = async () => {
    try {
        await db.sequelize.authenticate();
        const [results] = await db.sequelize.query(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('usuarios', 'espacos', 'reservas', 'amenities', 'espaco_amenities')
        `);
        return parseInt(results[0].count) >= 5;
    } catch (error) {
        console.error('Erro ao verificar tabelas:', error);
        return false;
    }
};

// Função para criar usuários padrão
const createDefaultUsers = async () => {
    try {
        const adminExists = await db.Usuario.findOne({ where: { login: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await db.Usuario.create({
                nome: 'Administrador',
                login: 'admin',
                senha: hashedPassword,
                tipo: 1
            });
            console.log('Usuário admin criado com sucesso');
        }

        const userExists = await db.Usuario.findOne({ where: { login: 'usuario' } });
        if (!userExists) {
            const hashedPassword = await bcrypt.hash('usuario123', 10);
            await db.Usuario.create({
                nome: 'Usuário Comum',
                login: 'usuario',
                senha: hashedPassword,
                tipo: 2
            });
            console.log('Usuário comum criado com sucesso');
        }

        const gestorExists = await db.Usuario.findOne({ where: { login: 'gestor' } });
        if (!gestorExists) {
            const hashedPassword = await bcrypt.hash('gestor123', 10);
            await db.Usuario.create({
                nome: 'Gestor',
                login: 'gestor',
                senha: hashedPassword,
                tipo: 3
            });
            console.log('Usuário gestor criado com sucesso');
        }
    } catch (error) {
        console.error('Erro ao criar usuários padrão:', error);
    }
};

// Função para criar dados de exemplo
const createSampleData = async () => {
    try {
        // Criar amenidades de exemplo
        const amenitiesCount = await db.Amenity.count();
        let amenities = [];
        if (amenitiesCount === 0) {
            amenities = await db.Amenity.bulkCreate([
                { nome: 'WiFi', descricao: 'Acesso à internet sem fio' },
                { nome: 'Projetor', descricao: 'Projetor para apresentações' },
                { nome: 'Ar Condicionado', descricao: 'Sistema de climatização' },
                { nome: 'Quadro Branco', descricao: 'Quadro para anotações' },
                { nome: 'Mesa de Reunião', descricao: 'Mesa grande para reuniões' }
            ]);
            console.log('Amenidades de exemplo criadas');
        } else {
            amenities = await db.Amenity.findAll();
        }

        // Criar espaços de exemplo
        const espacosCount = await db.Espaco.count();
        let espacos = [];
        if (espacosCount === 0) {
            espacos = await db.Espaco.bulkCreate([
                { nome: 'Sala de Reunião A', descricao: 'Sala para reuniões pequenas', capacidade: 8, localizacao: 'Térreo', ativo: true },
                { nome: 'Auditório', descricao: 'Espaço para apresentações', capacidade: 50, localizacao: '1º Andar', ativo: true },
                { nome: 'Sala de Treinamento', descricao: 'Sala para treinamentos', capacidade: 20, localizacao: '2º Andar', ativo: true }
            ]);
            console.log('Espaços de exemplo criados');
        } else {
            espacos = await db.Espaco.findAll();
        }

        // Criar associações N:N entre espaços e amenidades se não existirem
        const associacoesCount = await db.EspacoAmenity.count();
        if (associacoesCount === 0 && espacos.length > 0 && amenities.length > 0) {
            // Sala de Reunião A: WiFi, Ar Condicionado, Quadro Branco, Mesa de Reunião
            await espacos[0].addAmenities([amenities[0], amenities[2], amenities[3], amenities[4]]);
            
            // Auditório: WiFi, Projetor, Ar Condicionado
            await espacos[1].addAmenities([amenities[0], amenities[1], amenities[2]]);
            
            // Sala de Treinamento: WiFi, Projetor, Quadro Branco, Mesa de Reunião
            await espacos[2].addAmenities([amenities[0], amenities[1], amenities[3], amenities[4]]);
            
            console.log('Associações N:N Espaco-Amenity criadas');
        }
    } catch (error) {
        console.error('Erro ao criar dados de exemplo:', error);
    }
};

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

// ===================================================================
//  BLOCO DE INICIALIZAÇÃO FINAL
// ===================================================================

const PORT = process.env.PORT || 8082;

// Esta será a ÚNICA função que inicia tudo
const startApplication = async () => {
    try {
        console.log('Iniciando a inicialização da aplicação...');

        // --- Sua lógica de inicialização do banco de dados ---
        await db.createDatabaseIfNotExists();
        await db.connectAndSync();
        await connectDB(); // Sua função de conexão com o MongoDB

        // Sua lógica para popular o banco de dados
        const tablesExist = await checkTablesExist();
        if (!tablesExist) {
            console.log('Criando dados iniciais...');
            await createDefaultUsers();
            await createSampleData();
        } else {
            console.log('Dados iniciais já existem.');
        }
        console.log('✅ Inicialização do banco de dados concluída.');
        // --- Fim da sua lógica ---

        // Finalmente, inicia o servidor Express
        app.listen(PORT, () => {
            console.log(`✅ Servidor rodando com sucesso na porta ${PORT}`);
            console.log(`📚 API Docs disponível em: http://localhost:${PORT}/api/docs`);
        });

    } catch (error) {
        console.error('❌ Falha crítica ao iniciar a aplicação:', error);
        process.exit(1); // Encerra o processo se algo der errado
    }
};

// Chama a função para iniciar todo o processo
startApplication();