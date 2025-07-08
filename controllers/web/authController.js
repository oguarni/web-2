const bcrypt = require('bcryptjs');
const db = require('../../config/db_sequelize');

const authController = {};

// Mostra o formulário de login
authController.showLoginForm = (req, res) => {
    res.render('auth/login', {
        error_msg: req.session.error_msg,
        success_msg: req.session.success_msg
    });
    req.session.error_msg = null;
    req.session.success_msg = null;
};

// Processa o login
authController.login = async (req, res, next) => {
    try {
        const { login, senha } = req.body; // Usando 'login' em vez de 'email' para compatibilidade

        // Validação para garantir que os campos não estão vazios
        if (!login || !senha) {
            req.session.error_msg = 'Por favor, preencha todos os campos.';
            return res.redirect('/login');
        }

        const usuario = await db.Usuario.findOne({ where: { login } });

        if (!usuario) {
            req.session.error_msg = 'Credenciais inválidas. Verifique o seu login e senha.';
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(senha, usuario.senha);

        if (!isMatch) {
            req.session.error_msg = 'Credenciais inválidas. Verifique o seu login e senha.';
            return res.redirect('/login');
        }

        // Inicia a sessão com dados do usuário
        req.session.user = {
            id: usuario.id,
            nome: usuario.nome,
            tipo: usuario.tipo
        };

        res.redirect('/'); // Redireciona para a página principal
    } catch (error) {
        console.error('Erro no processo de login:', error);
        req.session.error_msg = 'Ocorreu um erro interno. Tente novamente mais tarde.';
        res.redirect('/login');
    }
};

// Controller para exibir o formulário de registo
authController.showRegisterForm = (req, res) => {
    res.render('auth/register');
};

// Controller para processar o registo de um novo utilizador
authController.register = async (req, res) => {
    const { nome, login, senha, senha2 } = req.body;

    if (senha !== senha2) {
        return res.render('auth/register', { error_msg: 'As senhas não correspondem.', nome, login });
    }
    if (senha.length < 6) {
        return res.render('auth/register', { error_msg: 'A senha deve ter pelo menos 6 caracteres.', nome, login });
    }

    try {
        const userExists = await db.Usuario.findOne({ where: { login: login } });
        if (userExists) {
            return res.render('auth/register', { error_msg: 'Este login já está em uso.', nome, login });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        await db.Usuario.create({
            nome,
            login,
            senha: hashedPassword,
            tipo: 2 // Tipo 2 (Utilizador Comum) por defeito
        });

        req.session.success_msg = 'Registo realizado com sucesso! Já pode fazer login.';
        res.redirect('/login');

    } catch (error) {
        console.error('Erro no registo:', error);
        res.render('auth/register', { error_msg: 'Ocorreu um erro ao tentar registar.', nome, login });
    }
};

// Processa o logout
authController.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Erro ao destruir a sessão: ", err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Limpa o cookie da sessão
        res.redirect('/login');
    });
};

module.exports = authController;