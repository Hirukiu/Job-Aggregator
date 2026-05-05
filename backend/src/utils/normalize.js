// Normalise une offre d'emploi brute en un format standard
function normalizeJob(raw) {
  return {
    title: raw.title || '',
    company: raw.company || '',
    location: raw.location || '',
    salary: raw.salary || null,
    remote: raw.remote === true,
    url: raw.url || null,
  };
}

module.exports = { normalizeJob };
