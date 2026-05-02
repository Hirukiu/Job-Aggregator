const request = require('supertest');
const app     = require('../app');

// Mock du pool MySQL pour ne pas avoir besoin d'une vraie base en CI
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const pool = require('../config/db');

// Mock de bcryptjs pour accélérer les tests (pas de vrai hash)
jest.mock('bcryptjs', () => ({
  hash:    jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

const bcrypt = require('bcryptjs');

afterEach(() => {
  jest.clearAllMocks();
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('retourne 400 si des champs sont manquants', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' }); // name et password manquants

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('retourne 400 si le mot de passe est trop court', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('retourne 409 si l\'email est déjà utilisé', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // email déjà en base

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('error');
  });

  it('retourne 201 si le compte est créé avec succès', async () => {
    pool.query
      .mockResolvedValueOnce([[]])        // aucun utilisateur existant
      .mockResolvedValueOnce([{ insertId: 42 }]); // insertion réussie

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('retourne 400 si des champs sont manquants', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com' }); // password manquant

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('retourne 401 si l\'email n\'existe pas', async () => {
    pool.query.mockResolvedValueOnce([[]]); // aucun utilisateur trouvé

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('retourne 401 si le mot de passe est incorrect', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, password: 'hashed', role: 'user' }]]);
    bcrypt.compare.mockResolvedValueOnce(false); // mauvais mot de passe

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('retourne 200 et un token si les identifiants sont corrects', async () => {
    pool.query.mockResolvedValueOnce([[{
      id: 1, name: 'Alice', email: 'alice@test.com', password: 'hashed', role: 'user',
    }]]);
    bcrypt.compare.mockResolvedValueOnce(true); // bon mot de passe

    // JWT_SECRET nécessaire pour signer le token
    process.env.JWT_SECRET = 'test_secret';

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@test.com');
  });
});
