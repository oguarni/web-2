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
    userType: Joi.number().integer().valid(1, 2), // 1 = admin, 2 = user
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
        nome: patterns.name.required(),
        descricao: Joi.string().max(500).allow('').optional(),
        capacidade: Joi.number().integer().min(1).max(1000).required(),
        localizacao: Joi.string().min(2).max(200).trim().required(),
        equipamentos: Joi.string().max(1000).allow('').optional()
    }),
    update: Joi.object({
        nome: patterns.name,
        descricao: Joi.string().max(500).allow(''),
        capacidade: Joi.number().integer().min(1).max(1000),
        localizacao: Joi.string().min(2).max(200).trim(),
        equipamentos: Joi.string().max(1000).allow(''),
        ativo: Joi.boolean()
    }).min(1),
    availability: Joi.object({
        dataInicio: patterns.dateTime.required(),
        dataFim: patterns.dateTime.required()
    }).custom((value, helpers) => {
        const { dataInicio, dataFim } = value;
        if (new Date(dataInicio) >= new Date(dataFim)) {
            return helpers.error('custom.dateRange');
        }
        if (new Date(dataInicio) < new Date()) {
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
        titulo: patterns.name.required(),
        descricao: Joi.string().max(500).allow('').optional(),
        dataInicio: patterns.dateTime.required(),
        dataFim: patterns.dateTime.required(),
        espacoId: patterns.objectId.required()
    }).custom((value, helpers) => {
        const { dataInicio, dataFim } = value;
        const start = new Date(dataInicio);
        const end = new Date(dataFim);
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
        titulo: patterns.name,
        descricao: Joi.string().max(500).allow(''),
        dataInicio: patterns.dateTime,
        dataFim: patterns.dateTime,
        status: patterns.status
    }).min(1).custom((value, helpers) => {
        const { dataInicio, dataFim } = value;
        if (dataInicio && dataFim) {
            const start = new Date(dataInicio);
            const end = new Date(dataFim);
            if (start >= end) {
                return helpers.error('custom.dateRange');
            }
        }
        return value;
    }).messages({
        'custom.dateRange': 'End date must be after start date'
    }),
    updateStatus: Joi.object({
        status: patterns.status.required()
    })
};

// Log schemas
const logSchemas = {
    create: Joi.object({
        usuarioId: patterns.objectId.required(),
        acao: Joi.string().min(1).max(100).trim().required(),
        ip: Joi.string().ip().required(),
        detalhes: Joi.object().optional()
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
    validateLog,
    validatePagination,
    patterns,
    authSchemas,
    userSchemas,
    spaceSchemas,
    reservationSchemas,
    logSchemas,
    querySchemas
};