const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/web/usuarioController');
const webAuth = require('../../middlewares/webAuth');

// All usuario routes require authentication and admin privileges
router.use(webAuth.auth);
router.use(webAuth.admin);

// GET /usuarios
router.get('/', usuarioController.index);

// GET /usuarios/new
router.get('/new', usuarioController.new);

// POST /usuarios
router.post('/', usuarioController.create);

// GET /usuarios/:id
router.get('/:id', usuarioController.show);

// GET /usuarios/:id/edit
router.get('/:id/edit', usuarioController.edit);

// PUT /usuarios/:id
router.put('/:id', usuarioController.update);

// DELETE /usuarios/:id
router.delete('/:id', usuarioController.destroy);

module.exports = router;