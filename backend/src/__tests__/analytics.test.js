const request = require('supertest');
const app     = require('../app');

jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../config/db');

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/analytics', () => {
  it('returns 200 with a success status', async () => {
    // Mock the 7 parallel queries with minimal data.
    pool.query
      .mockResolvedValueOnce([[{ total: 10 }]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ remote_count: 3, onsite_count: 7, total: 10 }]])
      .mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/analytics');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.totalOffers).toBe(10);
  });
});
