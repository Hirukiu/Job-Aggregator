const express = require('express');
const { listOffers } = require('../controllers/offersController');

const router = express.Router();

// List offers from our database.
// This is public for now, so the frontend team can use the data easily.
router.get('/', listOffers);

module.exports = router;
