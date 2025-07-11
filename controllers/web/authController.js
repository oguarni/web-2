// controllers/web/authController.js

const bcrypt = require('bcryptjs');
const db = require('../../config/db_sequelize');

// Controller para exibir o formulário de login
// Garante que as mensagens de erro/sucesso sejam exibidas e depois limpas.
exports.showLoginForm = (req, res) => {
    res.render('auth/login', {
        error_msg: req.session.error_msg,
        success_msg: req.session.success_msg
    });
    req.session.error_msg = null;
    req.session.success_msg = null;
};

// Controller para processar o login
exports.login = async (req, res) => {
    const { login, senha } = req.body;

    // Validação para garantir que os campos não estão vazios
    if (!login || !senha) {
        req.session.error_msg = 'Por favor, preencha todos os campos.';
        return res.redirect('/web/login');
    }

    try {
        // Get database from app context to avoid module loading issues
        const database = req.app.get('db');
        const user = await database.User.findOne({ 
            where: { login } 
        });

        // Verifica se o utilizador foi encontrado
        if (!user) {
            req.session.error_msg = 'Credenciais inválidas. Verifique o seu login e senha.';
            return res.redirect('/web/login');
        }

        // Compara a senha fornecida com a senha "hashada" guardada
        const isPasswordValid = await bcrypt.compare(senha, user.password);
        
        if (!isPasswordValid) {
            req.session.error_msg = 'Credenciais inválidas. Verifique o seu login e senha.';
            return res.redirect('/web/login');
        }

        // Sucesso! A senha está correta. Criamos a sessão do utilizador.
        req.session.user = {
            id: user.id,
            name: user.name,
            type: user.type
        };
        
        // Redireciona para a página principal após o login
        return res.redirect('/web/dashboard');

    } catch (error) {
        console.error('Erro no processo de login:', error);
        req.session.error_msg = 'Ocorreu um erro interno. Tente novamente mais tarde.';
        return res.redirect('/web/login');
    }
};

// Controller para exibir o formulário de registo
exports.showRegisterForm = (req, res) => {
    res.render('auth/register');
};

// Controller para processar o registo de um novo utilizador
exports.register = async (req, res) => {
    const { nome, login, senha, senha2 } = req.body;

    if (senha !== senha2) {
        return res.render('auth/register', { error_msg: 'As senhas não correspondem.', nome, login });
    }
    if (senha.length < 6) {
        return res.render('auth/register', { error_msg: 'A senha deve ter pelo menos 6 caracteres.', nome, login });
    }

    try {
        const userExists = await db.User.findOne({ where: { login: login } });
        if (userExists) {
            return res.render('auth/register', { error_msg: 'Este login já está em uso.', nome, login });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.User.create({
            name: nome,
            login,
            password: hashedPassword,
            type: 2 // Tipo 2 (Utilizador Comum) por defeito
        });

        req.session.success_msg = 'Registo realizado com sucesso! Já pode fazer login.';
        res.redirect('/web/login');

    } catch (error) {
        console.error('Erro no registo:', error);
        res.render('auth/register', { error_msg: 'Ocorreu um erro ao tentar registar.', nome, login });
    }
};

// Controller para fazer logout
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Erro ao destruir a sessão: ", err);
            return res.redirect('/');
        }
        // Limpa o cookie para garantir um logout completo
        res.clearCookie('connect.sid');
        res.redirect('/web/login');
    });
};

// Controller para exibir o dashboard
exports.dashboard = (req, res) => {
    const user = req.session.user;
    const isAdmin = user.type === 1;
    const isGestor = user.type === 3;
    const isComum = user.type === 2;
    
    res.render('dashboard/index', {
        title: 'Dashboard',
        user: user,
        isAuthenticated: true,
        isAdmin: isAdmin,
        isGestor: isGestor,
        isComum: isComum,
        isAdminOrGestor: isAdmin || isGestor,
        stats: {
            totalUsuarios: 3,
            totalEspacos: 0,
            totalReservas: 0,
            minhasReservas: 0
        }
    });
};