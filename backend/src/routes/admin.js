const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  listUsers, updateUserRole, deleteUser,
  listAllOffers, updateOfferStatus, deleteOffer,
} = require('../controllers/adminController');

const router = express.Router();

// Toutes les routes admin nécessitent un JWT valide + le rôle ADMIN
router.use(authenticate, requireRole('ADMIN'));

// ── Gestion des utilisateurs ──────────────────────────────────────────────────
router.get('/users',                listUsers);
router.patch('/users/:id/role',     updateUserRole);
router.delete('/users/:id',         deleteUser);

// ── Modération des offres ─────────────────────────────────────────────────────
router.get('/offers',               listAllOffers);
router.patch('/offers/:id/status',  updateOfferStatus);
router.delete('/offers/:id',        deleteOffer);

module.exports = router;
