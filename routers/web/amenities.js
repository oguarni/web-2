const express = require('express');
const router = express.Router();
const amenityController = require('../../controllers/web/amenityController');
const webAuth = require('../../middlewares/webAuth');

// All amenity routes require authentication and admin/gestor privileges
router.use(webAuth.auth);
router.use(webAuth.manager);

// GET /amenities
router.get('/', amenityController.index);

// GET /amenities/new
router.get('/new', amenityController.new);

// POST /amenities
router.post('/', amenityController.create);

// GET /amenities/:id
router.get('/:id', amenityController.show);

// GET /amenities/:id/edit
router.get('/:id/edit', amenityController.edit);

// PUT /amenities/:id
router.put('/:id', amenityController.update);

// DELETE /amenities/:id
router.delete('/:id', amenityController.destroy);

module.exports = router;