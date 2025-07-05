const db = require('../../config/db_sequelize');
const { asyncHandler } = require('../../middlewares/errorHandler');
const bcrypt = require('bcryptjs');

module.exports = {
    // GET /login
    loginForm: asyncHandler(async (req, res) => {
        if (req.session.user) {
            return res.redirect('/dashboard');
        }
        res.render('auth/login', {
            title: 'Login',
            layout: 'auth'
        });
    }),

    // POST /login
    login: asyncHandler(async (req, res) => {
        const { login, senha } = req.body;
        
        if (!login || !senha) {
            req.flash('error', 'Login e senha são obrigatórios');
            return res.redirect('/login');
        }

        try {
            const user = await db.Usuario.findOne({ where: { login } });
            
            if (!user) {
                req.flash('error', 'Credenciais inválidas');
                return res.redirect('/login');
            }

            const isValidPassword = await bcrypt.compare(senha, user.senha);
            
            if (!isValidPassword) {
                req.flash('error', 'Credenciais inválidas');
                return res.redirect('/login');
            }

            req.session.user = {
                id: user.id,
                nome: user.nome,
                login: user.login,
                tipo: user.tipo
            };

            req.flash('success', `Bem-vindo, ${user.nome}!`);
            res.redirect('/dashboard');
        } catch (error) {
            req.flash('error', 'Erro interno do servidor');
            res.redirect('/login');
        }
    }),

    // GET /logout
    logout: asyncHandler(async (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                req.flash('error', 'Erro ao fazer logout');
                return res.redirect('/dashboard');
            }
            res.redirect('/login');
        });
    }),

    // GET /dashboard
    dashboard: asyncHandler(async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userType = req.session.user.tipo;
        const userName = req.session.user.nome;
        
        let dashboardData = {
            title: 'Dashboard',
            user: req.session.user,
            isAdmin: userType === 1,
            isGestor: userType === 3,
            isComum: userType === 2
        };

        if (userType === 1) {
            // Admin can see all stats
            const [totalUsuarios, totalEspacos, totalReservas] = await Promise.all([
                db.Usuario.count(),
                db.Espaco.count(),
                db.Reserva.count()
            ]);
            dashboardData.stats = { totalUsuarios, totalEspacos, totalReservas };
        } else if (userType === 3) {
            // Gestor can see space-related stats
            const [totalEspacos, totalReservas] = await Promise.all([
                db.Espaco.count(),
                db.Reserva.count()
            ]);
            dashboardData.stats = { totalEspacos, totalReservas };
        } else {
            // Common user sees only their reservations
            const minhasReservas = await db.Reserva.count({
                where: { usuario_id: req.session.user.id }
            });
            dashboardData.stats = { minhasReservas };
        }

        res.render('dashboard/index', dashboardData);
    })
};