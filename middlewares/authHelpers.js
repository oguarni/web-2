const { ForbiddenError } = require('./errorHandler');

/**
 * Middleware to check if user is admin (type 1)
 * Throws ForbiddenError if not admin, allowing centralized error handling
 */
const ensureAdmin = (req, res, next) => {
    if (req.user.type !== 1) {
        throw new ForbiddenError('Access denied. Admin privileges required.');
    }
    next();
};

/**
 * Middleware to check if user is owner of resource or admin
 * @param {string} paramName - Parameter name to check (default: 'id')
 * @param {string} userIdField - Field name in resource to compare (default: 'usuarioId')
 */
const ensureOwnerOrAdmin = (paramName = 'id', userIdField = 'usuarioId') => {
    return async (req, res, next) => {
        // Admin can access everything
        if (req.user.type === 1) {
            return next();
        }
        
        // Store the ownership check parameters for controller use
        req.ownershipCheck = {
            paramName,
            userIdField,
            userId: req.user.id
        };
        
        next();
    };
};

/**
 * Helper function to filter query based on user type
 * Returns appropriate where clause for Sequelize queries
 */
const getUserBasedWhereClause = (req, additionalWhere = {}) => {
    if (req.user.type === 1) {
        // Admin can see everything
        return additionalWhere;
    } else {
        // Regular user can only see their own resources
        return {
            ...additionalWhere,
            usuarioId: req.user.id
        };
    }
};

/**
 * Helper function to check if user can access specific resource
 * @param {Object} resource - The resource object from database
 * @param {Object} req - Express request object
 * @param {string} userIdField - Field name in resource to compare (default: 'usuarioId')
 */
const canAccessResource = (resource, req, userIdField = 'usuarioId') => {
    // Admin can access everything
    if (req.user.type === 1) {
        return true;
    }
    
    // Regular user can only access their own resources
    return resource && resource[userIdField] === req.user.id;
};

/**
 * Helper function to ensure user can access resource, throws error if not
 * @param {Object} resource - The resource object from database
 * @param {Object} req - Express request object
 * @param {string} userIdField - Field name in resource to compare (default: 'usuarioId')
 * @param {string} resourceName - Name of resource for error message (default: 'Resource')
 */
const ensureCanAccessResource = (resource, req, userIdField = 'usuarioId', resourceName = 'Resource') => {
    if (!canAccessResource(resource, req, userIdField)) {
        throw new ForbiddenError(`Access denied: You can only access your own ${resourceName.toLowerCase()}s`);
    }
};

/**
 * Helper function to check if user is admin
 */
const isAdmin = (req) => {
    return req.user && req.user.type === 1;
};

/**
 * Helper function to check if user is owner of resource
 */
const isOwner = (resource, req, userIdField = 'usuarioId') => {
    return resource && resource[userIdField] === req.user.id;
};

module.exports = {
    ensureAdmin,
    ensureOwnerOrAdmin,
    getUserBasedWhereClause,
    canAccessResource,
    ensureCanAccessResource,
    isAdmin,
    isOwner
};