const express = require('express');
const router = express.Router();

// Import middlewares
const { validateToken, requireAdmin, requireOwnerOrAdmin } = require('../middlewares/tokenAuth');

// Import API controllers
const authController = require('../controllers/api/authController');
const usuarioController = require('../controllers/api/usuarioController');
const reservaController = require('../controllers/api/reservaController');
const espacoController = require('../controllers/api/espacoController');
const logController = require('../controllers/api/logController');

// Authentication routes (public)
router.post('/auth/login', authController.login);

// Protected routes - require valid token
router.use(validateToken);

// Usuario routes
router.get('/usuarios', requireAdmin, usuarioController.index);
router.get('/usuarios/:id', requireAdmin, usuarioController.show);
router.post('/usuarios', requireAdmin, usuarioController.create);
router.put('/usuarios/:id', requireAdmin, usuarioController.update);
router.delete('/usuarios/:id', requireAdmin, usuarioController.delete);

// Reserva routes
router.get('/reservas', reservaController.index);
router.get('/reservas/:id', reservaController.show);
router.post('/reservas', reservaController.create);
router.put('/reservas/:id', reservaController.update);
router.delete('/reservas/:id', reservaController.delete);
router.put('/reservas/:id/status', requireAdmin, reservaController.updateStatus);

// Espaco routes
router.get('/espacos', espacoController.index);
router.get('/espacos/:id', espacoController.show);
router.post('/espacos', requireAdmin, espacoController.create);
router.put('/espacos/:id', requireAdmin, espacoController.update);
router.delete('/espacos/:id', requireAdmin, espacoController.delete);
router.get('/espacos/:id/disponibilidade', espacoController.checkAvailability);

// Log routes (admin only)
router.get('/logs', requireAdmin, logController.index);
router.get('/logs/:id', requireAdmin, logController.show);
router.post('/logs', requireAdmin, logController.create);
router.get('/logs/stats', requireAdmin, logController.getStats);
router.delete('/logs/cleanup', requireAdmin, logController.cleanup);

// API documentation route
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Reservas de Espaços - API v1.0',
        documentation: '/api/docs',
        endpoints: {
            auth: {
                'POST /api/auth/login': 'Authenticate user and get token'
            },
            usuarios: {
                'GET /api/usuarios': 'List all users (admin only)',
                'GET /api/usuarios/:id': 'Get user by ID (admin only)',
                'POST /api/usuarios': 'Create new user (admin only)',
                'PUT /api/usuarios/:id': 'Update user (admin only)',
                'DELETE /api/usuarios/:id': 'Delete user (admin only)'
            },
            reservas: {
                'GET /api/reservas': 'List reservations (own or all if admin)',
                'GET /api/reservas/:id': 'Get reservation by ID',
                'POST /api/reservas': 'Create new reservation',
                'PUT /api/reservas/:id': 'Update reservation',
                'DELETE /api/reservas/:id': 'Delete reservation',
                'PUT /api/reservas/:id/status': 'Change reservation status (admin only)'
            },
            espacos: {
                'GET /api/espacos': 'List all spaces',
                'GET /api/espacos/:id': 'Get space by ID',
                'POST /api/espacos': 'Create new space (admin only)',
                'PUT /api/espacos/:id': 'Update space (admin only)',
                'DELETE /api/espacos/:id': 'Delete space (admin only)',
                'GET /api/espacos/:id/disponibilidade': 'Check space availability'
            },
            logs: {
                'GET /api/logs': 'List system logs (admin only)',
                'GET /api/logs/:id': 'Get log by ID (admin only)',
                'POST /api/logs': 'Create new log entry (admin only)',
                'GET /api/logs/stats': 'Get log statistics (admin only)',
                'DELETE /api/logs/cleanup': 'Clean old logs (admin only)'
            }
        }
    });
});

module.exports = router;