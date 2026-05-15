const express = require('express');
const { ingestWeLoveDevs } = require('../controllers/ingestionController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Only admins can trigger a manual ingestion.
router.post('/welovedevs', authenticate, requireRole('ADMIN'), ingestWeLoveDevs);

module.exports = router;
