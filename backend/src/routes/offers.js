const express = require('express');
const { listOffers, getOffer } = require('../controllers/offersController');

const router = express.Router();

router.get('/', listOffers);
router.get('/:id', getOffer);

module.exports = router;
