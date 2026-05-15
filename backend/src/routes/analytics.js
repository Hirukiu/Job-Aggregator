const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

// Public route — aggregate data only, no personal information exposed.
router.get('/', getAnalytics);

module.exports = router;
