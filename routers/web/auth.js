const express = require('express');
const router = express.Router();
const authController = require('../../controllers/web/authController');
const { redirectIfAuthenticated, requireAuth } = require('../../middlewares/webAuth');

// Login routes
router.get('/login', redirectIfAuthenticated, authController.loginForm);
router.post('/login', redirectIfAuthenticated, authController.login);

// Register routes
router.get('/register', redirectIfAuthenticated, authController.registerForm);
router.post('/register', redirectIfAuthenticated, authController.register);

// Logout route
router.get('/logout', authController.logout);

// Dashboard route
router.get('/dashboard', requireAuth, authController.dashboard);

module.exports = router;