// Normalize a simple raw job object.
// This function is kept for the first normalization tests.
function normalizeJob(raw) {
  // We only accept objects because other types cannot be normalized safely.
  if (!raw || typeof raw !== 'object') {
    throw new Error('normalizeJob: raw job must be an object');
  }

  // Each field is cleaned or replaced by a safe default value.
  return {
    title:    typeof raw.title === 'string'    ? raw.title.trim()    : '',
    company:  typeof raw.company === 'string'  ? raw.company.trim()  : '',
    location: typeof raw.location === 'string' ? raw.location.trim() : '',
    salary:   typeof raw.salary === 'number' && raw.salary >= 0 ? raw.salary : null,
    remote:   raw.remote === true,
    url:      typeof raw.url === 'string' && raw.url.startsWith('http') ? raw.url.trim() : null,
  };
}

// Return a clean string, or a default value when the field is empty.
function cleanText(value, fallback = '') {
  // If the value is a non-empty string, we remove spaces around it.
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

// Convert a date or timestamp to the MySQL DATETIME format.
// WeLoveDevs can send timestamps in seconds, milliseconds or microseconds.
function toDateTime(value) {
  // If there is no date, we use the current date.
  if (!value) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  // We first try to read the value as a number.
  let timestamp = Number(value);

  // Very large timestamps are usually in microseconds.
  // JavaScript Date needs milliseconds, so we divide by 1000.
  if (Number.isFinite(timestamp) && timestamp > 9999999999999) {
    timestamp = Math.floor(timestamp / 1000);
  }

  // If it is a number, we support seconds and milliseconds.
  // If not, we let JavaScript try to parse it as a date string.
  const date = Number.isFinite(timestamp)
    ? new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000)
    : new Date(value);

  // If the date is invalid, we use the current date instead.
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  // MySQL DATETIME uses "YYYY-MM-DD HH:mm:ss".
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Convert external contract names to our database enum.
function normalizeContractType(raw) {
  // WeLoveDevs can put contract data in different fields.
  // We join all useful values into one simple string.
  const contractValues = [
    ...(Array.isArray(raw.contractTypes) ? raw.contractTypes : []),
    raw.type,
    raw.details?.contracts?.permanent ? 'permanent' : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // We map external words to our SQL enum values.
  if (contractValues.includes('intern') || contractValues.includes('stage')) {
    return 'INTERNSHIP';
  }
  if (contractValues.includes('apprentice') || contractValues.includes('alternance')) {
    return 'APPRENTICESHIP';
  }
  if (contractValues.includes('freelance')) {
    return 'FREELANCE';
  }
  if (contractValues.includes('cdd')) {
    return 'CDD';
  }
  if (contractValues.includes('permanent') || contractValues.includes('cdi')) {
    return 'CDI';
  }

  return 'OTHER';
}

// Convert the salary object to a simple readable string.
function normalizeSalary(raw) {
  // Salary is optional in WeLoveDevs offers.
  const salary = raw.details?.salary;

  // If there is no salary object, we store null.
  if (!salary || typeof salary !== 'object') {
    return null;
  }

  // We keep salary as a readable string for the first version.
  const currency = cleanText(salary.currency, 'EUR');
  const recurrence = cleanText(salary.recurrence, 'year');

  // We convert numeric fields and ignore invalid numbers.
  const min = Number.isFinite(Number(salary.min)) ? Number(salary.min) : null;
  const max = Number.isFinite(Number(salary.max)) ? Number(salary.max) : null;
  const maxPerYear = Number.isFinite(Number(salary.maxPerYear)) ? Number(salary.maxPerYear) : null;

  // The best case is a salary range.
  if (min !== null && max !== null) {
    return `${min}-${max} ${currency}/${recurrence}`;
  }

  // Some offers only provide a maximum per year.
  if (maxPerYear !== null) {
    return `up to ${maxPerYear} ${currency}/year`;
  }

  // Some offers only provide a maximum.
  if (max !== null) {
    return `up to ${max} ${currency}/${recurrence}`;
  }

  // Some offers only provide a minimum.
  if (min !== null) {
    return `from ${min} ${currency}/${recurrence}`;
  }

  return null;
}

// Return a readable location for the offer.
function normalizeLocation(raw) {
  // WeLoveDevs often sends formattedPlaces as an array.
  if (Array.isArray(raw.formattedPlaces) && raw.formattedPlaces.length > 0) {
    return raw.formattedPlaces.map((place) => cleanText(place)).filter(Boolean).join(', ');
  }

  // If there is no formatted place, we use a simple fallback.
  return cleanText(raw.location, 'Remote or not specified');
}

// Build the URL where the user can apply or read the job offer.
function normalizeApplyUrl(raw) {
  // If the API already gives a valid URL, we keep it.
  if (typeof raw.applyUrl === 'string' && raw.applyUrl.startsWith('http')) {
    return raw.applyUrl.trim();
  }

  // Otherwise we build a WeLoveDevs URL from the offer alias or id.
  const alias = cleanText(raw.seoAlias || raw.id || raw.objectID);

  return alias ? `https://welovedevs.com/app/jobs/${encodeURIComponent(alias)}` : null;
}

// Normalize one WeLoveDevs job to our internal offer format.
// This object matches the columns used in the offers table.
function normalizeWeLoveDevsJob(raw) {
  // The raw offer must be an object.
  if (!raw || typeof raw !== 'object') {
    throw new Error('normalizeWeLoveDevsJob: raw job must be an object');
  }

  // The external id is important because it prevents duplicate offers.
  const externalId = cleanText(raw.id || raw.objectID || raw.reference);

  // Without an id, we cannot safely save the offer.
  if (!externalId) {
    throw new Error('normalizeWeLoveDevsJob: job id is required');
  }

  // Remote information can be stored in different WeLoveDevs fields.
  const remoteText = cleanText(raw.details?.acceptRemote || raw.details?.remotePolicy?.frequency).toLowerCase();

  // This returned object has the same names as our offers table columns.
  return {
    external_id:   externalId,
    source:        'welovedevs',
    title:         cleanText(raw.title, 'Untitled offer'),
    description:   cleanText(raw.rawDescription || raw.description || raw.descriptionPreview, 'No description available.'),
    company:       cleanText(raw.smallCompany?.companyName || raw.companyName || raw.companyId, 'Unknown company'),
    location:      normalizeLocation(raw),
    contract_type: normalizeContractType(raw),
    salary:        normalizeSalary(raw),
    remote:        remoteText.includes('remote') ? 1 : 0,
    apply_url:     normalizeApplyUrl(raw),
    published_at:  toDateTime(raw.publishDate || raw.createdAt || raw.lastUpdate),
    raw_payload:   raw,
  };
}

module.exports = { normalizeJob, normalizeWeLoveDevsJob };
