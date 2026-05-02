const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

// POST /api/auth/register
// Crée un nouvel utilisateur dans la base
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validation manuelle des champs obligatoires
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'name, email and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters.' });
    }

    // Vérifie si l'email est déjà utilisé
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Email already in use.' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion en base
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    return res.status(201).json({ status: 'success', message: 'Account created successfully.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
// verifie les identifiants et retourne un token JWT
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validation manuelle
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'email and password are required.' });
    }

    // Cherche l'utilisateur par email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    // renvoie un message d'erreurs si le mot de passe ou l'email est invalide
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }

    // creation du token 
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      status: 'success',
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
