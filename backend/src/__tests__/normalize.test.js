const { normalizeJob, normalizeWeLoveDevsJob } = require('../utils/normalize');

describe('normalizeJob', () => {
  it('normalizes a simple job object', () => {
    // Given: a raw job with spaces around text fields.
    const rawJob = {
      title:    '  Developer Node.js  ',
      company:  '  Acme Corp  ',
      location: '  Paris  ',
      salary:   45000,
      remote:   true,
      url:      'https://example.com/job/123',
    };

    // When: we normalize the raw job.
    const job = normalizeJob(rawJob);

    // Then: text fields are trimmed and values are kept.
    expect(job).toEqual({
      title:    'Developer Node.js',
      company:  'Acme Corp',
      location: 'Paris',
      salary:   45000,
      remote:   true,
      url:      'https://example.com/job/123',
    });
  });

  it('uses safe default values when fields are missing', () => {
    // Given: an empty raw job.
    // When: we normalize it.
    const job = normalizeJob({});

    // Then: the result uses safe default values.
    expect(job.title).toBe('');
    expect(job.company).toBe('');
    expect(job.salary).toBeNull();
    expect(job.remote).toBe(false);
  });
});

describe('normalizeWeLoveDevsJob', () => {
  it('normalizes a WeLoveDevs offer for our database', () => {
    // Given: a raw offer with the same shape as WeLoveDevs API.
    const rawOffer = {
      id:              'job-123',
      title:           'Backend Node Developer',
      rawDescription:  'Build APIs with Node and Docker.',
      publishDate:     1714550400000,
      contractTypes:   ['permanent'],
      formattedPlaces: ['Paris'],
      smallCompany:    { companyName: 'We Love Tests' },
      seoAlias:        'backend-node-developer',
      details: {
        acceptRemote: 'full remote',
        salary:       {
          min:        45000,
          max:        55000,
          currency:   'EUR',
          recurrence: 'year',
        },
      },
    };

    // When: we normalize the raw external offer.
    const offer = normalizeWeLoveDevsJob(rawOffer);

    // Then: ids and source are ready for our database.
    expect(offer.external_id).toBe('job-123');
    expect(offer.source).toBe('welovedevs');

    // Then: main fields are readable for the frontend.
    expect(offer.title).toBe('Backend Node Developer');
    expect(offer.company).toBe('We Love Tests');
    expect(offer.location).toBe('Paris');

    // Then: business fields match our database format.
    expect(offer.contract_type).toBe('CDI');
    expect(offer.salary).toBe('45000-55000 EUR/year');
    expect(offer.remote).toBe(1);

    // Then: URL and date are normalized too.
    expect(offer.apply_url).toBe('https://welovedevs.com/app/jobs/backend-node-developer');
    expect(offer.published_at).toBe('2024-05-01 08:00:00');
  });

  it('rejects a WeLoveDevs offer without id', () => {
    // A missing id is dangerous because we use it to avoid duplicates.
    expect(() => normalizeWeLoveDevsJob({ title: 'No id' })).toThrow();
  });
});
