const { normalizeJob } = require('../utils/normalize');

describe('normalizeJob', () => {
  it('normalise une offre complète correctement', () => {
    const raw = {
      title:    '  Développeur Node.js  ',
      company:  '  Acme Corp  ',
      location: '  Paris  ',
      salary:   45000,
      remote:   true,
      url:      'https://example.com/job/123',
    };

    const result = normalizeJob(raw);

    expect(result.title).toBe('Développeur Node.js');
    expect(result.company).toBe('Acme Corp');
    expect(result.location).toBe('Paris');
    expect(result.salary).toBe(45000);
    expect(result.remote).toBe(true);
    expect(result.url).toBe('https://example.com/job/123');
  });

  it('remplace les champs manquants par des valeurs par défaut', () => {
    const result = normalizeJob({});

    expect(result.title).toBe('');
    expect(result.company).toBe('');
    expect(result.location).toBe('');
    expect(result.salary).toBeNull();
    expect(result.remote).toBe(false);
    expect(result.url).toBeNull();
  });

  it('ignore un salaire négatif et le met à null', () => {
    const result = normalizeJob({ salary: -1000 });
    expect(result.salary).toBeNull();
  });

  it('ignore une url invalide (sans http) et la met à null', () => {
    const result = normalizeJob({ url: 'ftp://not-valid.com' });
    expect(result.url).toBeNull();
  });

  it('met remote à false si la valeur n\'est pas strictement true', () => {
    expect(normalizeJob({ remote: 1 }).remote).toBe(false);
    expect(normalizeJob({ remote: 'yes' }).remote).toBe(false);
    expect(normalizeJob({ remote: true }).remote).toBe(true);
  });

  it('lève une erreur si raw n\'est pas un objet', () => {
    expect(() => normalizeJob(null)).toThrow();
    expect(() => normalizeJob('string')).toThrow();
    expect(() => normalizeJob(42)).toThrow();
  });
});
