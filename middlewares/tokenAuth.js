const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL_ERROR: JWT_SECRET is not defined in environment variables.');
}

// Middleware to validate JWT
const validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Access token is required'));
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach decoded user payload to request
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new UnauthorizedError('Token has expired'));
        }
        return next(new ForbiddenError('Invalid token'));
    }
};

// Middleware to require admin privileges
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.tipo === 1) {
        return next();
    }
    next(new ForbiddenError('Admin access required'));
};

// Middleware to require admin or manager privileges
const requireAdminOrManager = (req, res, next) => {
    if (req.user && (req.user.tipo === 1 || req.user.tipo === 3)) {
        return next();
    }
    next(new ForbiddenError('Admin or manager access required'));
};

// Generic role checking middleware
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError('Access token is required'));
        }

        const userRoleMap = {
            1: 'admin',
            2: 'client',
            3: 'manager'
        };

        const userRole = userRoleMap[req.user.tipo];
        
        if (!allowedRoles.includes(userRole)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }
        
        next();
    };
};

module.exports = {
    validateToken,
    requireAdmin,
    requireAdminOrManager,
    checkRole
};
