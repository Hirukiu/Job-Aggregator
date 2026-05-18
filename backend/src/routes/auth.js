const express   = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// limmiter le nb de connection 
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { status: 'error', message: 'Too many login attempts, please try again later.' },
});

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/loging"
router.post('/login', loginLimiter, login);

module.exports = router;
