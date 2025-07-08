const express = require('express');
const router = express.Router();
const authController = require('../../controllers/web/authController');
// Corrigido: Importa o objeto webAuth e pega as funções dele
const webAuth = require('../../middlewares/webAuth'); 
const { validate } = require('../../middlewares/validation');
const { loginSchema } = require('../../validators/authValidator');

// Rota para exibir o formulário de login
router.get('/login', webAuth.guest, authController.showLoginForm);

// Rota para processar o login
router.post('/login', webAuth.guest, validate(loginSchema), authController.login);

// Rota para processar o logout
router.post('/logout', webAuth.auth, authController.logout);

module.exports = router;