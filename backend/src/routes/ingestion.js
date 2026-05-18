const express = require('express');
const { ingestWeLoveDevs } = require('../controllers/ingestionController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// route d'ingestion
router.post('/welovedevs', authenticate, requireRole('ADMIN'), ingestWeLoveDevs);

module.exports = router;
