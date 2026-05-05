const { normalizeJob } = require('../utils/normalize');

describe('normalizeJob', () => {
  it('normalise une offre complète correctement', () => {
    const raw = {
      title:    'Développeur Node.js',
      company:  'Acme Corp',
      location: 'Paris',
      salary:   45000,
      remote:   true,
      url:      'https://example.com/job/123',
    };

    const result = normalizeJob(raw);

    expect(result.title).toBe('Développeur Node.js');
    expect(result.company).toBe('Acme Corp');
    expect(result.salary).toBe(45000);
    expect(result.remote).toBe(true);
    expect(result.url).toBe('https://example.com/job/123');
  });

  it('remplace les champs manquants par des valeurs par défaut', () => {
    const result = normalizeJob({});

    expect(result.title).toBe('');
    expect(result.company).toBe('');
    expect(result.salary).toBeNull();
    expect(result.remote).toBe(false);
    expect(result.url).toBeNull();
  });

  it('met remote à false si la valeur n\'est pas strictement true', () => {
    expect(normalizeJob({ remote: 1 }).remote).toBe(false);
    expect(normalizeJob({ remote: 'yes' }).remote).toBe(false);
    expect(normalizeJob({ remote: true }).remote).toBe(true);
  });
});
