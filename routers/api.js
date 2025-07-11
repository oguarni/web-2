const express = require('express');
const router = express.Router();

// Import middlewares
const { validateToken, requireAdmin, requireAdminOrManager, checkRole } = require('../middlewares/tokenAuth');
const { 
    validateAuth, 
    validateUser, 
    validateSpace, 
    validateReservation, 
    validateLog 
} = require('../middlewares/validation');

// Import API controllers
const authController = require('../controllers/api/authController');
const usuarioController = require('../controllers/api/usuarioController');
const reservaController = require('../controllers/api/reservaController');
const espacoController = require('../controllers/api/espacoController');
const logController = require('../controllers/api/logController');
const amenityController = require('../controllers/api/amenityController');
const espacoAmenityController = require('../controllers/api/espacoAmenityController');

// =================================================================
// ROTAS PÚBLICAS (Não requerem token)
// =================================================================

// Auth routes
router.post('/auth/login', validateAuth.login, authController.login);

// User registration route
router.post('/usuarios', validateUser.create, usuarioController.create);

// Health check endpoint - publicly accessible for container monitoring
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


// =================================================================
// ROTAS PROTEGIDAS (Requerem um token válido a partir daqui)
// =================================================================
router.use(validateToken);

// Auth routes that require a token
router.get('/auth/me', authController.me);
router.get('/auth/verify', (req, res) => {
  res.json({ user: req.user });
});

// User routes (Admin: full CRUD, Manager: read-only)
// A criação de usuário foi movida para cima para ser pública.
router.get('/usuarios', checkRole(['admin', 'manager']), usuarioController.index);
router.get('/usuarios/:id', checkRole(['admin', 'manager']), validateUser.idParam, usuarioController.show);
router.put('/usuarios/:id', requireAdmin, validateUser.idParam, validateUser.update, usuarioController.update);
router.delete('/usuarios/:id', requireAdmin, validateUser.idParam, usuarioController.delete);

// Reservation routes (Admin, Manager: full CRUD, Client: own reservations only)
router.get('/reservas', checkRole(['admin', 'manager', 'client']), reservaController.index);
router.post('/reservas', checkRole(['admin', 'manager', 'client']), validateReservation.create, reservaController.create);
router.get('/reservas/:id', checkRole(['admin', 'manager', 'client']), validateReservation.idParam, reservaController.show);
router.put('/reservas/:id', checkRole(['admin', 'manager', 'client']), validateReservation.idParam, validateReservation.update, reservaController.update);
router.delete('/reservas/:id', checkRole(['admin', 'manager', 'client']), validateReservation.idParam, reservaController.delete);
router.put('/reservas/:id/status', checkRole(['admin', 'manager']), validateReservation.idParam, validateReservation.updateStatus, reservaController.updateStatus);

// Space routes (Admin, Manager: full CRUD, Client: read-only)
router.get('/espacos', checkRole(['admin', 'manager', 'client']), validateSpace.filter, espacoController.index);
router.post('/espacos', checkRole(['admin', 'manager']), validateSpace.create, espacoController.create);
router.get('/espacos/:id', checkRole(['admin', 'manager', 'client']), validateSpace.idParam, espacoController.show);
router.put('/espacos/:id', checkRole(['admin', 'manager']), validateSpace.idParam, validateSpace.update, espacoController.update);
router.delete('/espacos/:id', checkRole(['admin', 'manager']), validateSpace.idParam, espacoController.delete);
router.get('/espacos/:id/disponibilidade', checkRole(['admin', 'manager', 'client']), validateSpace.idParam, validateSpace.availability, espacoController.checkAvailability);

// Amenity routes (Admin, Manager: full CRUD, Client: read-only)
router.get('/amenities', checkRole(['admin', 'manager', 'client']), amenityController.index);
router.post('/amenities', checkRole(['admin', 'manager']), amenityController.store);
router.get('/amenities/:id', checkRole(['admin', 'manager', 'client']), amenityController.show);
router.put('/amenities/:id', checkRole(['admin', 'manager']), amenityController.update);
router.delete('/amenities/:id', checkRole(['admin', 'manager']), amenityController.destroy);

// Space-Amenity relationship routes (Admin, Manager: full CRUD)
router.post('/espacos/:espacoId/amenities', checkRole(['admin', 'manager']), espacoAmenityController.addAmenityToSpace);
router.delete('/espacos/:espacoId/amenities/:amenityId', checkRole(['admin', 'manager']), espacoAmenityController.removeAmenityFromSpace);

// Log routes (Admin only)
router.get('/logs/stats', requireAdmin, validateLog.query, logController.getStats);
router.get('/logs', requireAdmin, validateLog.query, logController.index);
router.get('/logs/:id', requireAdmin, validateLog.idParam, logController.show);
router.post('/logs', requireAdmin, validateLog.create, logController.create);
router.delete('/logs/cleanup', requireAdmin, validateLog.cleanup, logController.cleanup);

module.exports = router;