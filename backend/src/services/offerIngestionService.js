const pool = require('../config/db');
const { normalizeWeLoveDevsJob } = require('../utils/normalize');
const { fetchWeLoveDevsJobs } = require('./welovedevsClient');

// Insert one offer in the database.
// If the offer already exists, we update it instead of creating a duplicate.
async function upsertOffer(offer) {
  // pool.query sends the SQL request to MySQL.
  const [result] = await pool.query(
    // external_id is unique in SQL, so it is used to detect duplicates.
    `INSERT INTO offers
      (external_id, source, title, description, company, location, contract_type,
       salary, remote, apply_url, raw_payload, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       /* If the offer already exists, we refresh the useful fields. */
       title = VALUES(title),
       description = VALUES(description),
       company = VALUES(company),
       location = VALUES(location),
       contract_type = VALUES(contract_type),
       salary = VALUES(salary),
       remote = VALUES(remote),
       apply_url = VALUES(apply_url),
       raw_payload = VALUES(raw_payload),
       published_at = VALUES(published_at),
       is_active = 1`,
    [
      // Values must be in the same order as the INSERT columns above.
      offer.external_id,
      offer.source,
      offer.title,
      offer.description,
      offer.company,
      offer.location,
      offer.contract_type,
      offer.salary,
      offer.remote,
      offer.apply_url,

      // raw_payload is an object, so we save it as a JSON string.
      JSON.stringify(offer.raw_payload),
      offer.published_at,
    ]
  );

  // We return the MySQL result for tests or future logs.
  return result;
}

// Import one page of offers from WeLoveDevs.
// This function is the main data pipeline: fetch, normalize, save.
async function ingestWeLoveDevsOffers(options = {}) {
  // First step: get raw data from the external API.
  const payload = await fetchWeLoveDevsJobs(options);

  // WeLoveDevs stores the offers in payload.values.
  const jobs = Array.isArray(payload.values) ? payload.values : [];

  // Second step: convert each external offer to our internal format.
  const normalizedOffers = jobs.map(normalizeWeLoveDevsJob);

  // We save offers one by one. It is simple and respects the project level.
  for (const offer of normalizedOffers) {
    await upsertOffer(offer);
  }

  return {
    // This result is sent back to the admin after import.
    source:     'welovedevs',
    totalCount: payload.totalCount || normalizedOffers.length,
    imported:   normalizedOffers.length,
    page:       Number(options.page) || 0,
    size:       Number(options.size) || 20,
  };
}

module.exports = { ingestWeLoveDevsOffers, upsertOffer };
