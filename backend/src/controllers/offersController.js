const pool = require('../config/db');

// Return a list of offers from our database.
// The frontend can use this route for search and filters.
async function listOffers(req, res, next) {
  try {
    // We only show active offers.
    const filters = ['is_active = 1'];

    // params will contain the safe SQL values for ? placeholders.
    const params = [];

    // Read filters from the URL query string.
    const { q, location, contract_type: contractType, source } = req.query;

    // We keep a safe limit, so one request cannot return too many rows.
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    // Search in the most useful text fields.
    if (q && String(q).trim()) {
      // Add one SQL condition for the search.
      filters.push('(title LIKE ? OR company LIKE ? OR description LIKE ?)');

      // Add % around the text to search inside strings.
      const search = `%${String(q).trim()}%`;

      // We add the same search value for title, company and description.
      params.push(search, search, search);
    }

    // Optional filters used by the frontend.
    if (location && String(location).trim()) {
      // Location is also a partial search.
      filters.push('location LIKE ?');
      params.push(`%${String(location).trim()}%`);
    }

    if (contractType && String(contractType).trim()) {
      // Contract type must match the enum value exactly.
      filters.push('contract_type = ?');
      params.push(String(contractType).trim());
    }

    if (source && String(source).trim()) {
      // Source can be "welovedevs" or another future source.
      filters.push('source = ?');
      params.push(String(source).trim());
    }

    // Join all filters into one WHERE clause.
    const where = `WHERE ${filters.join(' AND ')}`;

    // Parameters are passed separately to protect against SQL injection.
    const [rows] = await pool.query(
      `SELECT id, external_id, source, title, description, company, location,
              contract_type, salary, remote, apply_url, published_at
       FROM offers
       ${where}
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.json({
      // Keep the same response shape for all successful routes.
      status: 'success',
      data:   rows,
    });
  } catch (err) {
    // Send errors to the central error handler.
    next(err);
  }
}

// GET /api/offers/:id — retourne le détail d'une offre
async function getOffer(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, external_id, source, title, description, company, location,
              contract_type, salary, remote, apply_url, published_at
       FROM offers
       WHERE id = ? AND is_active = 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Offer not found.' });
    }

    return res.json({ status: 'success', data: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { listOffers, getOffer };
