const express = require('express');
const { ingestWeLoveDevs } = require('../controllers/ingestionController');

const router = express.Router();

router.post('/welovedevs', ingestWeLoveDevs);

module.exports = router;
