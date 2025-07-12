// Custom error classes for better error handling
class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
    }
}

// Centralized error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging (in development) - only for non-operational errors
    if (process.env.NODE_ENV !== 'production' && (!err.isOperational || err.statusCode >= 500)) {
        console.error('Error:', err);
    }

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const message = 'Validation failed';
        const details = err.errors.map(error => ({
            field: error.path,
            message: error.message,
            value: error.value
        }));
        error = new ValidationError(message, details);
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        let message = 'Duplicate value entered';
        const details = err.errors.map(error => {
            let fieldMessage = `${error.path} must be unique`;
            
            // Provide specific user-friendly messages for common fields
            switch(error.path) {
                case 'email':
                    fieldMessage = 'This email is already in use';
                    break;
                case 'login':
                    fieldMessage = 'This login is already in use';
                    break;
                case 'nome':
                    fieldMessage = 'This name is already in use';
                    break;
                case 'cpf':
                    fieldMessage = 'This CPF is already in use';
                    break;
                default:
                    fieldMessage = `This ${error.path} is already in use`;
            }
            
            return {
                field: error.path,
                message: fieldMessage,
                value: error.value
            };
        });
        
        // Set a more specific message if it's a single field error
        if (details.length === 1) {
            message = details[0].message;
        }
        
        error = new ConflictError(message);
        error.details = details;
    }

    // Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Invalid reference to related resource';
        error = new ValidationError(message);
    }

    // Sequelize connection error
    if (err.name === 'SequelizeConnectionError' || err.name === 'ConnectionRefusedError') {
        const message = 'Database connection failed';
        error = new AppError(message, 503, 'DATABASE_ERROR');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new UnauthorizedError(message);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new UnauthorizedError(message);
    }

    // Joi validation error
    if (err.isJoi) {
        const message = 'Validation failed';
        const details = err.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
        }));
        error = new ValidationError(message, details);
    }

    // MongoDB connection error
    if (err.message && err.message.includes('ENOTFOUND') && err.message.includes('mongodb')) {
        const message = 'Database connection failed';
        error = new AppError(message, 503, 'DATABASE_ERROR');
    }

    // Default to operational error if not already set
    if (!error.isOperational) {
        error = new AppError('Something went wrong', 500, 'INTERNAL_ERROR');
    }

    // Send error response
    const response = {
        error: error.message,
        ...(error.errorCode && { code: error.errorCode }),
        ...(error.details && { details: error.details })
    };

    // Include stack trace in development
    if (process.env.NODE_ENV !== 'production' && error.statusCode === 500) {
        response.stack = err.stack;
    }

    res.status(error.statusCode || 500).json(response);
};

// Async error wrapper to catch promise rejections
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    errorHandler,
    asyncHandler,
    notFoundHandler
};