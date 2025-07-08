const express = require('express');
const router = express.Router();
const logController = require('../../controllers/web/logController');
const webAuth = require('../../middlewares/webAuth');

// All log routes require authentication and admin privileges
router.use(webAuth.auth);
router.use(webAuth.admin);

// GET /logs
router.get('/', logController.index);

// GET /logs/cleanup
router.get('/cleanup', logController.cleanup);

// POST /logs/cleanup
router.post('/cleanup', logController.performCleanup);

// GET /logs/:id
router.get('/:id', logController.show);

module.exports = router;