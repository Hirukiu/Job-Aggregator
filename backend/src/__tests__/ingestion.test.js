const request = require('supertest');
const jwt     = require('jsonwebtoken');

// We mock the ingestion service.
// The route test must not call the real WeLoveDevs API.
jest.mock('../services/offerIngestionService', () => ({
  ingestWeLoveDevsOffers: jest.fn(),
}));

// This is the mocked service function used by the route.
const { ingestWeLoveDevsOffers } = require('../services/offerIngestionService');
const app = require('../app');

// Build a valid ADMIN token signed with the same secret used by the middleware.
// In CI, JWT_SECRET is set to 'ci_secret' via the workflow env.
const ADMIN_TOKEN = jwt.sign(
  { id: 1, role: 'ADMIN' },
  process.env.JWT_SECRET || 'ci_secret'
);

// Clean mocked calls after each test.
afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/ingestion/welovedevs', () => {
  it('starts the WeLoveDevs import', async () => {
    // Given: the ingestion service will return a fake import result.
    ingestWeLoveDevsOffers.mockResolvedValueOnce({
      source:     'welovedevs',
      totalCount: 42,
      imported:   5,
      page:       0,
      size:       5,
    });

    // When: the route is called with a valid ADMIN token.
    const res = await request(app)
      .post('/api/ingestion/welovedevs')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ q: 'node', size: 5 });

    // Then: the backend says that the import was created.
    expect(res.status).toBe(201);

    // Then: the response contains the number of imported offers.
    expect(res.body.data.imported).toBe(5);

    // Then: the route sent the expected options to the service.
    expect(ingestWeLoveDevsOffers).toHaveBeenCalledWith({ page: 0, q: 'node', size: 5 });
  });
});
