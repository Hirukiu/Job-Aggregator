const pool = require('../config/db');
const { normalizeWeLoveDevsJob } = require('../utils/normalize');
const { fetchWeLoveDevsJobs } = require('./welovedevsClient');
const { classifyOffer } = require('../utils/classifier');

// Insert one offer in the database.
// If the offer already exists, we update it instead of creating a duplicate.
async function upsertOffer(offer) {
  // pool.query sends the SQL request to MySQL.
  const [result] = await pool.query(
    // external_id is unique in SQL, so it is used to detect duplicates.
    `INSERT INTO offers
      (external_id, source, title, description, company, location, contract_type,
       salary, remote, apply_url, raw_payload, category, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
       category = VALUES(category),
       published_at = VALUES(published_at),
       is_active = 1`,
    [
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
      JSON.stringify(offer.raw_payload),
      offer.category,
      offer.published_at,
    ]
  );

  return result;
}

// Import one page of offers from WeLoveDevs.
// This function is the main data pipeline: fetch, normalize, classify, save.
async function ingestWeLoveDevsOffers(options = {}) {
  // First step: get raw data from the external API.
  const payload = await fetchWeLoveDevsJobs(options);

  // WeLoveDevs stores the offers in payload.values.
  const jobs = Array.isArray(payload.values) ? payload.values : [];

  // Second step: normalize then classify each offer.
  const normalizedOffers = jobs.map((job) => {
    const offer = normalizeWeLoveDevsJob(job);
    // AI classification: assign a domain category based on title + description.
    offer.category = classifyOffer(offer.title, offer.description);
    return offer;
  });

  // We save offers one by one.
  for (const offer of normalizedOffers) {
    await upsertOffer(offer);
  }

  return {
    source:     'welovedevs',
    totalCount: payload.totalCount || normalizedOffers.length,
    imported:   normalizedOffers.length,
    page:       Number(options.page) || 0,
    size:       Number(options.size) || 20,
  };
}

module.exports = { ingestWeLoveDevsOffers, upsertOffer };
