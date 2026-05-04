const request = require('supertest');
const app     = require('../app');

// We mock the database, so the test does not need a real MySQL server.
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

// This is the mocked pool used by the controller.
const pool = require('../config/db');

// After each test, we clean all mocked calls.
// This avoids one test changing the result of another test.
afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/offers', () => {
  it('returns offers from the database', async () => {
    // Given: one offer already exists in the database.
    const storedOffers = [
      {
        id:            1,
        external_id:   'wld-1',
        source:        'welovedevs',
        title:         'Node Developer',
        description:   'Build APIs',
        company:       'Acme',
        location:      'Paris',
        contract_type: 'CDI',
        salary:        '45000-55000 EUR/year',
        remote:        1,
        apply_url:     'https://welovedevs.com/app/jobs/wld-1',
        published_at:  '2024-05-01 08:00:00',
      },
    ];

    // The controller expects pool.query to return [rows].
    // Here rows = storedOffers.
    pool.query.mockResolvedValueOnce([storedOffers]);

    // When: the frontend calls the offers route.
    const res = await request(app).get('/api/offers?q=node');

    // Then: the API returns a success response.
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    // Then: the first offer has the expected title.
    expect(res.body.data[0].title).toBe('Node Developer');

    // Then: the controller used the database once.
    expect(pool.query).toHaveBeenCalledTimes(1);
  });
});
