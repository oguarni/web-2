const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middlewares/webAuth');

// Import route modules
const authRoutes = require('./auth');
const usuarioRoutes = require('./usuarios');
const espacoRoutes = require('./espacos');
const reservaRoutes = require('./reservas');
const amenityRoutes = require('./amenities');
const espacoAmenityRoutes = require('./espaco-amenities');
const logRoutes = require('./logs');

// Root redirect
router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Auth routes (login, logout, dashboard)
router.use('/', authRoutes);

// Entity routes
router.use('/usuarios', usuarioRoutes);
router.use('/espacos', espacoRoutes);
router.use('/reservas', reservaRoutes);
router.use('/amenities', amenityRoutes);
router.use('/espaco-amenities', espacoAmenityRoutes);
router.use('/logs', logRoutes);

module.exports = router;