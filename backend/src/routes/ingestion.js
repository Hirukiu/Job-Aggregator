const express = require('express');
const { ingestWeLoveDevs } = require('../controllers/ingestionController');

const router = express.Router();

// Start a WeLoveDevs import.
// For this first data version, we keep the route simple and public.
// Access control can be added later without changing the data pipeline.
router.post('/welovedevs', ingestWeLoveDevs);

module.exports = router;
