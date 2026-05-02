/**
 * Normalise une offre d'emploi brute provenant d'une source externe
 * (API tierce, scraping, etc.) en un format standard utilisé en base.
 *
 * @param {object} raw - Offre brute avec des champs variables selon la source
 * @returns {object} Offre normalisée avec des champs garantis
 */
function normalizeJob(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('normalizeJob: raw job must be an object');
  }

  return {
    title:    typeof raw.title === 'string'    ? raw.title.trim()    : '',
    company:  typeof raw.company === 'string'  ? raw.company.trim()  : '',
    location: typeof raw.location === 'string' ? raw.location.trim() : '',
    salary:   typeof raw.salary === 'number' && raw.salary >= 0 ? raw.salary : null,
    remote:   raw.remote === true,
    url:      typeof raw.url === 'string' && raw.url.startsWith('http') ? raw.url.trim() : null,
  };
}

module.exports = { normalizeJob };
