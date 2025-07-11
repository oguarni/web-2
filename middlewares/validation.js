const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

// Common validation patterns
const patterns = {
    objectId: Joi.number().integer().positive(),
    email: Joi.string().email(),
    password: Joi.string().min(4).max(50),
    name: Joi.string().min(2).max(100).trim(),
    login: Joi.string().min(3).max(50).alphanum().trim(),
    dateTime: Joi.date().iso(),
    userType: Joi.number().integer().valid(1, 2, 3), // 1 = admin, 2 = user, 3 = manager
    status: Joi.string().valid('pendente', 'confirmada', 'cancelada')
};

// Authentication schemas
const authSchemas = {
    login: Joi.object({
        login: patterns.login.required(),
        senha: patterns.password.required()
    })
};

// User schemas
const userSchemas = {
    create: Joi.object({
        nome: patterns.name.required(),
        login: patterns.login.required(),
        senha: patterns.password.required(),
        tipo: patterns.userType.required()
    }),
    update: Joi.object({
        nome: patterns.name,
        login: patterns.login,
        senha: patterns.password,
        tipo: patterns.userType
    }).min(1) // At least one field must be provided
};

// Space schemas
const spaceSchemas = {
    create: Joi.object({
        name: patterns.name.required(),
        description: Joi.string().max(500).allow('').optional(),
        capacity: Joi.number().integer().min(1).max(1000).required(),
        location: Joi.string().min(2).max(200).trim().required(),
        equipment: Joi.string().max(1000).allow('').optional()
    }),
    update: Joi.object({
        name: patterns.name,
        description: Joi.string().max(500).allow(''),
        capacity: Joi.number().integer().min(1).max(1000),
        location: Joi.string().min(2).max(200).trim(),
        equipment: Joi.string().max(1000).allow(''),
        active: Joi.boolean()
    }).min(1),
    availability: Joi.object({
        startDate: patterns.dateTime.required(),
        endDate: patterns.dateTime.required()
    }).custom((value, helpers) => {
        const { startDate, endDate } = value;
        if (new Date(startDate) >= new Date(endDate)) {
            return helpers.error('custom.dateRange');
        }
        if (new Date(startDate) < new Date()) {
            return helpers.error('custom.pastDate');
        }
        return value;
    }).messages({
        'custom.dateRange': 'End date must be after start date',
        'custom.pastDate': 'Start date cannot be in the past'
    })
};

// Reservation schemas
const reservationSchemas = {
    create: Joi.object({
        title: patterns.name.required(),
        description: Joi.string().max(500).allow('').optional(),
        startDate: patterns.dateTime.required(),
        endDate: patterns.dateTime.required(),
        spaceId: patterns.objectId.required()
    }).custom((value, helpers) => {
        const { startDate, endDate } = value;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();
        
        if (start >= end) {
            return helpers.error('custom.dateRange');
        }
        if (start < now) {
            return helpers.error('custom.pastDate');
        }
        // Check if reservation is more than 1 year in advance
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (start > oneYearFromNow) {
            return helpers.error('custom.tooFarInFuture');
        }
        // Check if reservation is too long (max 24 hours)
        const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (end - start > maxDuration) {
            return helpers.error('custom.tooLong');
        }
        return value;
    }).messages({
        'custom.dateRange': 'End date must be after start date',
        'custom.pastDate': 'Start date cannot be in the past',
        'custom.tooFarInFuture': 'Reservations cannot be made more than 1 year in advance',
        'custom.tooLong': 'Reservation cannot exceed 24 hours'
    }),
    update: Joi.object({
        title: patterns.name,
        description: Joi.string().max(500).allow(''),
        startDate: patterns.dateTime,
        endDate: patterns.dateTime,
        spaceId: patterns.objectId,
        status: patterns.status
    }).min(1).custom((value, helpers) => {
        const { startDate, endDate } = value;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const now = new Date();
            
            if (start >= end) {
                return helpers.error('custom.dateRange');
            }
            if (start < now) {
                return helpers.error('custom.pastDate');
            }
            // Check if reservation is more than 1 year in advance
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            if (start > oneYearFromNow) {
                return helpers.error('custom.tooFarInFuture');
            }
            // Check if reservation is too long (max 24 hours)
            const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (end - start > maxDuration) {
                return helpers.error('custom.tooLong');
            }
        }
        return value;
    }).messages({
        'custom.dateRange': 'End date must be after start date',
        'custom.pastDate': 'Start date cannot be in the past',
        'custom.tooFarInFuture': 'Reservations cannot be made more than 1 year in advance',
        'custom.tooLong': 'Reservation cannot exceed 24 hours'
    }),
    updateStatus: Joi.object({
        status: patterns.status.required()
    })
};

// Amenity schemas
const amenitySchemas = {
    create: Joi.object({
        name: patterns.name.required(),
        description: Joi.string().max(500).allow('').optional()
    }),
    update: Joi.object({
        name: patterns.name,
        description: Joi.string().max(500).allow('')
    }).min(1) // At least one field must be provided
};

// Log schemas
const logSchemas = {
    create: Joi.object({
        usuarioId: patterns.objectId.optional(),
        userId: patterns.objectId.optional(),
        acao: Joi.string().min(1).max(100).trim().optional(),
        action: Joi.string().min(1).max(100).trim().optional(),
        level: Joi.string().min(1).max(100).trim().optional(),
        message: Joi.string().min(1).max(500).trim().optional(),
        ip: Joi.string().ip().optional(),
        detalhes: Joi.object().optional()
    }).custom((value, helpers) => {
        // At least one user ID field is required
        if (!value.usuarioId && !value.userId) {
            return helpers.error('custom.userIdRequired');
        }
        // At least one action field is required
        if (!value.acao && !value.action && !value.level && !value.message) {
            return helpers.error('custom.actionRequired');
        }
        return value;
    }).messages({
        'custom.userIdRequired': 'Either usuarioId or userId is required',
        'custom.actionRequired': 'Either acao, action, level, or message is required'
    }),
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(50),
        usuarioId: patterns.objectId.optional(),
        acao: Joi.string().min(1).max(100).trim().optional(),
        startDate: patterns.dateTime.optional(),
        endDate: patterns.dateTime.optional()
    }).custom((value, helpers) => {
        const { startDate, endDate } = value;
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return helpers.error('custom.dateRange');
        }
        return value;
    }).messages({
        'custom.dateRange': 'End date must be after start date'
    }),
    cleanup: Joi.object({
        olderThan: patterns.dateTime.required().custom((value, helpers) => {
            const date = new Date(value);
            const now = new Date();
            if (date >= now) {
                return helpers.error('custom.futureDate');
            }
            return value;
        }).messages({
            'custom.futureDate': 'Date must be in the past'
        })
    })
};

// Query parameter schemas
const querySchemas = {
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    }),
    spaceFilter: Joi.object({
        ativo: Joi.boolean().optional()
    }),
    idParam: Joi.object({
        id: patterns.objectId.required()
    })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const data = req[property];
        
        const { error, value } = schema.validate(data, {
            abortEarly: false, // Return all validation errors
            allowUnknown: false, // Don't allow unknown fields
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const validationError = new ValidationError(
                'Validation failed',
                error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message.replace(/"/g, ''),
                    value: detail.context?.value
                }))
            );
            return next(validationError);
        }

        // Replace the original data with validated/sanitized data
        req[property] = value;
        next();
    };
};

// Specific validation middlewares
const validateAuth = {
    login: validate(authSchemas.login)
};

const validateUser = {
    create: validate(userSchemas.create),
    update: validate(userSchemas.update),
    idParam: validate(querySchemas.idParam, 'params')
};

const validateSpace = {
    create: validate(spaceSchemas.create),
    update: validate(spaceSchemas.update),
    availability: validate(spaceSchemas.availability, 'query'),
    idParam: validate(querySchemas.idParam, 'params'),
    filter: validate(querySchemas.spaceFilter, 'query')
};

const validateReservation = {
    create: validate(reservationSchemas.create),
    update: validate(reservationSchemas.update),
    updateStatus: validate(reservationSchemas.updateStatus),
    idParam: validate(querySchemas.idParam, 'params')
};

const validateAmenity = {
    create: validate(amenitySchemas.create),
    update: validate(amenitySchemas.update),
    idParam: validate(querySchemas.idParam, 'params')
};

const validateLog = {
    create: validate(logSchemas.create),
    query: validate(logSchemas.query, 'query'),
    cleanup: validate(logSchemas.cleanup),
    idParam: validate(querySchemas.idParam, 'params')
};

const validatePagination = validate(querySchemas.pagination, 'query');

module.exports = {
    validate,
    validateAuth,
    validateUser,
    validateSpace,
    validateReservation,
    validateAmenity,
    validateLog,
    validatePagination,
    patterns,
    authSchemas,
    userSchemas,
    spaceSchemas,
    reservationSchemas,
    amenitySchemas,
    logSchemas,
    querySchemas
};