const express = require('express');
const router = express.Router();
const espacoAmenityController = require('../../controllers/web/espacoAmenityController');
const webAuth = require('../../middlewares/webAuth');

// All espaco-amenity routes require authentication and admin/gestor privileges
router.use(webAuth.auth);
router.use(webAuth.manager);

// GET /espaco-amenities
router.get('/', espacoAmenityController.index);

// GET /espaco-amenities/new
router.get('/new', espacoAmenityController.new);

// POST /espaco-amenities
router.post('/', espacoAmenityController.create);

// GET /espaco-amenities/:espacoId/:amenityId
router.get('/:espacoId/:amenityId', espacoAmenityController.show);

// DELETE /espaco-amenities/:espacoId/:amenityId
router.delete('/:espacoId/:amenityId', espacoAmenityController.destroy);

module.exports = router;