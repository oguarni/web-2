const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Você precisa estar logado para acessar esta página');
        return res.redirect('/login');
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.tipo !== 1) {
        req.flash('error', 'Acesso negado. Apenas administradores podem acessar esta página');
        return res.redirect('/dashboard');
    }
    next();
};

const requireAdminOrGestor = (req, res, next) => {
    if (!req.session.user || (req.session.user.tipo !== 1 && req.session.user.tipo !== 3)) {
        req.flash('error', 'Acesso negado. Apenas administradores e gestores podem acessar esta página');
        return res.redirect('/dashboard');
    }
    next();
};

const redirectIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
};

const addUserToViews = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.isAdmin = req.session.user && req.session.user.tipo === 1;
    res.locals.isGestor = req.session.user && req.session.user.tipo === 3;
    res.locals.isComum = req.session.user && req.session.user.tipo === 2;
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireAdminOrGestor,
    redirectIfAuthenticated,
    addUserToViews
};