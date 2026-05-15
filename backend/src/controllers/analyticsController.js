const pool = require('../config/db');

// GET /api/analytics
// Returns aggregated statistics on active offers.
// All queries run on the existing offers table — no extra storage needed.
async function getAnalytics(req, res, next) {
  try {
    // Run all aggregation queries in parallel for speed.
    const [
      [totalRows],
      [byCategory],
      [byContractType],
      [topCompanies],
      [topLocations],
      [remoteRows],
      [byMonth],
    ] = await Promise.all([

      // 1. Total active offers.
      pool.query(
        `SELECT COUNT(*) AS total FROM offers WHERE is_active = 1`
      ),

      // 2. Count per AI-assigned category.
      pool.query(
        `SELECT category, COUNT(*) AS count
         FROM offers
         WHERE is_active = 1
         GROUP BY category
         ORDER BY count DESC`
      ),

      // 3. Count per contract type.
      pool.query(
        `SELECT contract_type, COUNT(*) AS count
         FROM offers
         WHERE is_active = 1
         GROUP BY contract_type
         ORDER BY count DESC`
      ),

      // 4. Top 10 companies by offer count.
      pool.query(
        `SELECT company, COUNT(*) AS count
         FROM offers
         WHERE is_active = 1
         GROUP BY company
         ORDER BY count DESC
         LIMIT 10`
      ),

      // 5. Top 10 locations by offer count.
      pool.query(
        `SELECT location, COUNT(*) AS count
         FROM offers
         WHERE is_active = 1
         GROUP BY location
         ORDER BY count DESC
         LIMIT 10`
      ),

      // 6. Remote vs on-site split.
      pool.query(
        `SELECT
           SUM(remote = 1)  AS remote_count,
           SUM(remote = 0)  AS onsite_count,
           COUNT(*)         AS total
         FROM offers
         WHERE is_active = 1`
      ),

      // 7. Offers published per month over the last 6 months.
      pool.query(
        `SELECT
           DATE_FORMAT(published_at, '%Y-%m') AS month,
           COUNT(*)                            AS count
         FROM offers
         WHERE is_active = 1
           AND published_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY month
         ORDER BY month ASC`
      ),
    ]);

    const total      = totalRows[0].total;
    const remoteData = remoteRows[0];

    return res.json({
      status: 'success',
      data: {
        totalOffers:    total,
        byCategory,
        byContractType,
        topCompanies,
        topLocations,
        remoteRatio: {
          remote: Number(remoteData.remote_count),
          onsite: Number(remoteData.onsite_count),
          total:  Number(remoteData.total),
        },
        byMonth,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
