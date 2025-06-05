const crypto = require('crypto');
const db = require('../config/db_sequelize');

// In-memory token store (in production, use Redis or database)
const tokenStore = new Map();
const TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

// Generate secure random token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Create token for user
const createToken = (userId, userType) => {
    const token = generateToken();
    const expires = Date.now() + TOKEN_EXPIRY;
    
    tokenStore.set(token, {
        userId,
        userType,
        expires
    });
    
    return token;
};

// Validate token middleware
const validateToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Access token required' 
        });
    }
    
    const tokenData = tokenStore.get(token);
    
    if (!tokenData || tokenData.expires < Date.now()) {
        tokenStore.delete(token);
        return res.status(401).json({ 
            error: 'Invalid or expired token' 
        });
    }
    
    // Attach user info to request
    req.user = {
        id: tokenData.userId,
        type: tokenData.userType
    };
    
    next();
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
    if (req.user.type !== 1) {
        return res.status(403).json({ 
            error: 'Admin access required' 
        });
    }
    next();
};

// Owner or admin middleware
const requireOwnerOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        const resourceId = req.params[paramName];
        
        // Admin can access everything
        if (req.user.type === 1) {
            return next();
        }
        
        // For other resources, check ownership in controller
        next();
    };
};

// Clean expired tokens (call periodically)
const cleanExpiredTokens = () => {
    const now = Date.now();
    for (const [token, data] of tokenStore.entries()) {
        if (data.expires < now) {
            tokenStore.delete(token);
        }
    }
};

// Clean expired tokens every 10 minutes
setInterval(cleanExpiredTokens, 600000);

module.exports = {
    createToken,
    validateToken,
    requireAdmin,
    requireOwnerOrAdmin,
    cleanExpiredTokens
};