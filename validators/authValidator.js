const Joi = require('joi');

// Schema de validação para o formulário de login
const loginSchema = Joi.object({
    // O campo 'email' deve ser uma string, um email válido, e é obrigatório.
    email: Joi.string().email().required().messages({
        'string.base': `"email" deve ser do tipo texto`,
        'string.empty': `"email" não pode ser um campo vazio`,
        'string.email': `"email" deve ser um email válido`,
        'any.required': `"email" é um campo obrigatório`
    }),
    // O campo 'senha' deve ser uma string, ter no mínimo 3 caracteres, e é obrigatório.
    senha: Joi.string().min(3).required().messages({
        'string.base': `"senha" deve ser do tipo texto`,
        'string.empty': `"senha" não pode ser um campo vazio`,
        'string.min': `"senha" deve ter um comprimento mínimo de {#limit} caracteres`,
        'any.required': `"senha" é um campo obrigatório`
    })
});

module.exports = {
    loginSchema
};