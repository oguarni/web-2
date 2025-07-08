const express = require('express');
const router = express.Router();
const espacoController = require('../../controllers/web/espacoController');
const { requireAuth, requireAdminOrGestor } = require('../../middlewares/webAuth');

// All espaco routes require authentication and admin/gestor privileges
router.use(requireAuth);
router.use(requireAdminOrGestor);

// GET /espacos
router.get('/', espacoController.index);

// GET /espacos/new
router.get('/new', espacoController.new);

// POST /espacos
router.post('/', espacoController.create);

// GET /espacos/:id
router.get('/:id', espacoController.show);

// GET /espacos/:id/edit
router.get('/:id/edit', espacoController.edit);

// PUT /espacos/:id
router.put('/:id', espacoController.update);

// DELETE /espacos/:id
router.delete('/:id', espacoController.destroy);

module.exports = router;