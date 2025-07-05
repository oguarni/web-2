const express = require('express');
const router = express.Router();

// Import middlewares
const { validateToken, requireAdmin } = require('../middlewares/tokenAuth');
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

// Protected routes - require valid token
router.use(validateToken);

// User routes (Admin only)
router.get('/usuarios', requireAdmin, usuarioController.index);
router.post('/usuarios', requireAdmin, validateUser.create, usuarioController.create);
router.get('/usuarios/:id', requireAdmin, validateUser.idParam, usuarioController.show);
router.put('/usuarios/:id', requireAdmin, validateUser.idParam, validateUser.update, usuarioController.update);
router.delete('/usuarios/:id', requireAdmin, validateUser.idParam, usuarioController.delete);

// Reservation routes
router.get('/reservas', reservaController.index);
router.post('/reservas', validateReservation.create, reservaController.create);
router.get('/reservas/:id', validateReservation.idParam, reservaController.show);
router.put('/reservas/:id', validateReservation.idParam, validateReservation.update, reservaController.update);
router.delete('/reservas/:id', validateReservation.idParam, reservaController.delete);
router.put('/reservas/:id/status', requireAdmin, validateReservation.idParam, validateReservation.updateStatus, reservaController.updateStatus);

// Space routes
router.get('/espacos', validateSpace.filter, espacoController.index);
router.post('/espacos', requireAdmin, validateSpace.create, espacoController.create);
router.get('/espacos/:id', validateSpace.idParam, espacoController.show);
router.put('/espacos/:id', requireAdmin, validateSpace.idParam, validateSpace.update, espacoController.update);
router.delete('/espacos/:id', requireAdmin, validateSpace.idParam, espacoController.delete);
router.get('/espacos/:id/disponibilidade', validateSpace.idParam, validateSpace.availability, espacoController.checkAvailability);

// Amenity routes (Admin only)
router.get('/amenities', requireAdmin, amenityController.index);
router.post('/amenities', requireAdmin, amenityController.store);
router.get('/amenities/:id', requireAdmin, amenityController.show);
router.put('/amenities/:id', requireAdmin, amenityController.update);
router.delete('/amenities/:id', requireAdmin, amenityController.destroy);

// Space-Amenity relationship routes (Admin only)
router.post('/espacos/:espacoId/amenities', requireAdmin, espacoAmenityController.addAmenityToSpace);
router.delete('/espacos/:espacoId/amenities/:amenityId', requireAdmin, espacoAmenityController.removeAmenityFromSpace);

// Log routes (Admin only)
router.get('/logs', requireAdmin, validateLog.query, logController.index);
router.get('/logs/:id', requireAdmin, validateLog.idParam, logController.show);
router.post('/logs', requireAdmin, validateLog.create, logController.create);
router.get('/logs/stats', requireAdmin, validateLog.query, logController.getStats);
router.delete('/logs/cleanup', requireAdmin, validateLog.cleanup, logController.cleanup);

module.exports = router;
