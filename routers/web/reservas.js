const express = require('express');
const router = express.Router();
const reservaController = require('../../controllers/web/reservaController');
const webAuth = require('../../middlewares/webAuth');

// All reserva routes require authentication
router.use(webAuth.auth);

// GET /reservas
router.get('/', reservaController.index);

// GET /reservas/new
router.get('/new', reservaController.new);

// POST /reservas
router.post('/', reservaController.create);

// GET /reservas/:id
router.get('/:id', reservaController.show);

// GET /reservas/:id/edit
router.get('/:id/edit', reservaController.edit);

// PUT /reservas/:id
router.put('/:id', reservaController.update);

// DELETE /reservas/:id
router.delete('/:id', reservaController.destroy);

module.exports = router;