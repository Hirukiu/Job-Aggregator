const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  listUsers, updateUserRole, deleteUser,
  listAllOffers, updateOfferStatus, deleteOffer,
} = require('../controllers/adminController');

const router = express.Router();

// routes admin
router.use(authenticate, requireRole('ADMIN'));

// routes utilisateurs
router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// routes des offres 
router.get('/offers', listAllOffers);
router.patch('/offers/:id/status', updateOfferStatus);
router.delete('/offers/:id', deleteOffer);

module.exports = router;
