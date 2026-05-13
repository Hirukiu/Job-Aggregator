const pool = require('../config/db');

// GET /api/admin/users — liste tous les utilisateurs
async function listUsers(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json({ status: 'success', data: rows });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/users/:id/role — change le rôle d'un utilisateur
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ status: 'error', message: 'Invalid role. Must be USER or ADMIN.' });
    }

    if (Number(id) === req.user.id) {
      return res.status(400).json({ status: 'error', message: 'You cannot change your own role.' });
    }

    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    return res.json({ status: 'success', message: `User role updated to ${role}.` });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id — supprime un utilisateur
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({ status: 'error', message: 'You cannot delete your own account.' });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }

    return res.json({ status: 'success', message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/offers — liste toutes les offres y compris inactives
async function listAllOffers(req, res, next) {
  try {
    const limit  = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const [rows] = await pool.query(
      `SELECT id, external_id, source, title, company, location,
              contract_type, salary, remote, is_active, published_at, created_at
       FROM offers
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return res.json({ status: 'success', data: rows });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/offers/:id/status — active ou désactive une offre
async function updateOfferStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ status: 'error', message: 'is_active must be a boolean.' });
    }

    const [result] = await pool.query(
      'UPDATE offers SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Offer not found.' });
    }

    return res.json({ status: 'success', message: `Offer ${is_active ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/offers/:id — supprime une offre
async function deleteOffer(req, res, next) {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM offers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Offer not found.' });
    }

    return res.json({ status: 'success', message: 'Offer deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, updateUserRole, deleteUser, listAllOffers, updateOfferStatus, deleteOffer };
