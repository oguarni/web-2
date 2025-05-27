// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
};

// Middleware para verificar se o usuário é admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.userType === 1) {
        next();
    } else {
        res.redirect('/home');
    }
};

// Middleware para verificar se usuário é proprietário da reserva ou admin
const isOwnerOrAdmin = async (req, res, next) => {
    const db = require('../config/db_sequelize');
    
    try {
        // Se for admin, permitir acesso
        if (req.session.userType === 1) {
            return next();
        }
        
        // Caso contrário, verificar propriedade do recurso
        const reservaId = req.params.id || req.body.id;
        const reserva = await db.Reserva.findByPk(reservaId);
        
        if (!reserva || reserva.usuarioId !== req.session.userId) {
            return res.redirect('/reservaList');
        }
        
        next();
    } catch (err) {
        console.log(err);
        res.redirect('/home');
    }
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isOwnerOrAdmin
};