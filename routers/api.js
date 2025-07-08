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

// Auth routes
router.post('/auth/login', validateAuth.login, authController.login);
router.get('/auth/me', validateToken, authController.me);

// Protected routes - require valid token
router.use(validateToken);

// User routes (Admin: full CRUD, Manager: read-only)
router.get('/usuarios', checkRole(['admin', 'manager']), usuarioController.index);
router.post('/usuarios', requireAdmin, validateUser.create, usuarioController.create);
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
router.get('/logs', requireAdmin, validateLog.query, logController.index);
router.get('/logs/:id', requireAdmin, validateLog.idParam, logController.show);
router.post('/logs', requireAdmin, validateLog.create, logController.create);
router.get('/logs/stats', requireAdmin, validateLog.query, logController.getStats);
router.delete('/logs/cleanup', requireAdmin, validateLog.cleanup, logController.cleanup);

module.exports = router;
