const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import middlewares
const { validateToken, requireAdmin, requireAdminOrManager, checkRole } = require('../middlewares/tokenAuth');
const { 
    validateAuth, 
    validateUser, 
    validateSpace, 
    validateReservation, 
    validateAmenity,
    validateLog 
} = require('../middlewares/validation');

// Import API controllers
const authController = require('../controllers/api/authController');
const userController = require('../controllers/api/userController');
const reservationController = require('../controllers/api/reservationController');
const spaceController = require('../controllers/api/spaceController');
const logController = require('../controllers/api/logController');
const amenityController = require('../controllers/api/amenityController');
const spaceAmenityController = require('../controllers/api/spaceAmenityController');

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// =================================================================
// PUBLIC ROUTES (Do not require token)
// =================================================================

// Apply general rate limiting to all API routes
router.use(generalLimiter);

// Auth routes
router.post('/auth/login', authLimiter, validateAuth.login, authController.login);

// User registration route
router.post('/usuarios', validateUser.create, userController.create);

// Health check endpoint - publicly accessible for container monitoring
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


// =================================================================
// PROTECTED ROUTES (Require valid token from here)
// =================================================================
router.use(validateToken);

// Auth routes that require a token
router.get('/auth/me', authController.me);
router.get('/auth/verify', (req, res) => {
  res.json({ user: req.user });
});

// User routes (Admin only: full CRUD)
// User creation was moved above to be public.
router.get('/usuarios', requireAdmin, userController.index);
router.get('/usuarios/:id', requireAdmin, validateUser.idParam, userController.show);
router.put('/usuarios/:id', requireAdmin, validateUser.idParam, validateUser.update, userController.update);
router.delete('/usuarios/:id', requireAdmin, validateUser.idParam, userController.delete);

// Reservation routes (Admin, Manager: full CRUD, Client: own reservations only)
router.get('/reservas', checkRole(['admin', 'manager', 'client']), reservationController.index);
router.post('/reservas', checkRole(['admin', 'manager', 'client']), validateReservation.create, reservationController.create);
router.get('/reservas/:id', checkRole(['admin', 'manager', 'client']), validateReservation.idParam, reservationController.show);
router.put('/reservas/:id', checkRole(['admin', 'manager', 'client']), validateReservation.idParam, validateReservation.update, reservationController.update);
router.delete('/reservas/:id', checkRole(['admin', 'manager', 'client']), validateReservation.idParam, reservationController.delete);
router.put('/reservas/:id/status', checkRole(['admin', 'manager']), validateReservation.idParam, validateReservation.updateStatus, reservationController.updateStatus);

// Space routes (Admin, Manager: full CRUD, Client: read-only)
router.get('/espacos', checkRole(['admin', 'manager', 'client']), validateSpace.filter, spaceController.index);
router.post('/espacos', checkRole(['admin', 'manager']), validateSpace.create, spaceController.create);
router.get('/espacos/:id', checkRole(['admin', 'manager', 'client']), validateSpace.idParam, spaceController.show);
router.put('/espacos/:id', checkRole(['admin', 'manager']), validateSpace.idParam, validateSpace.update, spaceController.update);
router.delete('/espacos/:id', checkRole(['admin', 'manager']), validateSpace.idParam, spaceController.delete);
router.get('/espacos/:id/disponibilidade', checkRole(['admin', 'manager', 'client']), validateSpace.idParam, validateSpace.availability, spaceController.checkAvailability);

// Amenity routes (Admin, Manager: full CRUD, Client: read-only)
router.get('/amenities', checkRole(['admin', 'manager', 'client']), amenityController.index);
router.post('/amenities', checkRole(['admin', 'manager']), validateAmenity.create, amenityController.store);
router.get('/amenities/:id', checkRole(['admin', 'manager', 'client']), validateAmenity.idParam, amenityController.show);
router.put('/amenities/:id', checkRole(['admin', 'manager']), validateAmenity.idParam, validateAmenity.update, amenityController.update);
router.delete('/amenities/:id', checkRole(['admin', 'manager']), validateAmenity.idParam, amenityController.destroy);

// Space-Amenity relationship routes (Admin, Manager: full CRUD)
router.post('/spaces/:spaceId/amenities', checkRole(['admin', 'manager']), spaceAmenityController.associateAmenity);
router.delete('/spaces/:spaceId/amenities/:amenityId', checkRole(['admin', 'manager']), spaceAmenityController.disassociateAmenity);

// Log routes (Admin only)
router.get('/logs/stats', requireAdmin, validateLog.query, logController.getStats);
router.get('/logs', requireAdmin, validateLog.query, logController.index);
router.get('/logs/:id', requireAdmin, validateLog.idParam, logController.show);
router.post('/logs', requireAdmin, validateLog.create, logController.create);
router.delete('/logs/cleanup', requireAdmin, validateLog.cleanup, logController.cleanup);

module.exports = router;