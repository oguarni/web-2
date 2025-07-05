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

    // GET /register
    registerForm: asyncHandler(async (req, res) => {
        if (req.session.user) {
            return res.redirect('/dashboard');
        }
        res.render('auth/register', {
            title: 'Cadastro',
            layout: 'auth'
        });
    }),

    // POST /register
    register: asyncHandler(async (req, res) => {
        const { nome, login, senha, confirmarSenha } = req.body;
        
        // Validações básicas
        if (!nome || !login || !senha || !confirmarSenha) {
            req.flash('error', 'Todos os campos são obrigatórios');
            return res.redirect('/register');
        }

        if (senha !== confirmarSenha) {
            req.flash('error', 'As senhas não coincidem');
            return res.redirect('/register');
        }

        if (senha.length < 6) {
            req.flash('error', 'A senha deve ter pelo menos 6 caracteres');
            return res.redirect('/register');
        }

        try {
            // Verificar se o login já existe
            const existingUser = await db.Usuario.findOne({ where: { login } });
            if (existingUser) {
                req.flash('error', 'Login já está em uso');
                return res.redirect('/register');
            }

            // Criar novo usuário
            const hashedPassword = await bcrypt.hash(senha, 10);
            const newUser = await db.Usuario.create({
                nome,
                login,
                senha: hashedPassword,
                tipo: 2 // Usuário comum por padrão
            });

            req.flash('success', 'Cadastro realizado com sucesso! Faça login para continuar.');
            res.redirect('/login');
        } catch (error) {
            console.error('Erro no cadastro:', error);
            req.flash('error', 'Erro interno do servidor');
            res.redirect('/register');
        }
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