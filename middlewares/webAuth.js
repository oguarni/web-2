const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Você precisa estar logado para acessar esta página');
        return res.redirect('/web/login');
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.type !== 1) {
        req.flash('error', 'Acesso negado. Apenas administradores podem acessar esta página');
        return res.redirect('/web/dashboard');
    }
    next();
};

const requireAdminOrGestor = (req, res, next) => {
    if (!req.session.user || (req.session.user.type !== 1 && req.session.user.type !== 3)) {
        req.flash('error', 'Acesso negado. Apenas administradores e gestores podem acessar esta página');
        return res.redirect('/web/dashboard');
    }
    next();
};

const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/web/dashboard');
    }
    next();
};

const addUserToViews = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.isAdmin = req.session.user && req.session.user.type === 1;
    res.locals.isGestor = req.session.user && req.session.user.type === 3;
    res.locals.isComum = req.session.user && req.session.user.type === 2;
    next();
};

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Você precisa estar logado para acessar esta página');
        return res.redirect('/web/login');
    }
    next();
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', 'Você precisa estar logado para acessar esta página');
            return res.redirect('/web/login');
        }

        const userRoleMap = {
            1: 'admin',
            2: 'client',
            3: 'manager'
        };

        const userRole = userRoleMap[req.session.user.type];
        
        if (!allowedRoles.includes(userRole)) {
            req.flash('error', 'Você não tem permissão para acessar esta página');
            return res.redirect('/web/dashboard');
        }
        
        next();
    };
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireAdminOrGestor,
    redirectIfAuthenticated,
    addUserToViews,
    isAuthenticated,
    checkRole
};