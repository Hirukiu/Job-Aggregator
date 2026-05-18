const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

// Public route
router.get('/', getAnalytics);

module.exports = router;
