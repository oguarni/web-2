const authHelpers = require('./authHelpers');

const webAuth = {};

// Middleware para permitir acesso apenas a convidados (não logados)
webAuth.guest = (req, res, next) => {
    if (!authHelpers.isAuthenticated(req)) {
        return next();
    }
    res.redirect('/dashboard');
};

// Middleware para proteger rotas que exigem autenticação
webAuth.auth = (req, res, next) => {
    if (authHelpers.isAuthenticated(req)) {
        return next();
    }
    res.redirect('/login');
};

// Middleware para proteger rotas de administrador
webAuth.admin = (req, res, next) => {
    if (authHelpers.hasRole(req, 'admin')) {
        return next();
    }
    res.status(403).send('Acesso negado. Requer perfil de Administrador.');
};

// Middleware para proteger rotas de gestor
webAuth.manager = (req, res, next) => {
    // Permite acesso a gestores e também a administradores
    if (authHelpers.hasRole(req, 'gestor') || authHelpers.hasRole(req, 'admin')) {
        return next();
    }
    res.status(403).send('Acesso negado. Requer perfil de Gestor ou Administrador.');
};

module.exports = webAuth;