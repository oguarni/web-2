const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('./errorHandler');

// Ensure JWT_SECRET is set in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key';

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

module.exports = {
    validateToken,
    requireAdmin
};
