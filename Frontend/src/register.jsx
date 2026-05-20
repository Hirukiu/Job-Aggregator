import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './assets/logo.png';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      setError("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Link to="/" className="back-button">
        <svg
          className="back-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Retour à l'accueil
      </Link>

      <main id="main-content" className="center-content">
        <div className="nav-brand">
          <Link to="/" aria-label="JobAlligator – retour à l'accueil" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src={Logo}
              alt=""
              style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
            />JobAlligator
          </Link>
        </div>
        <h1 className="title">Rejoignez le marais !</h1>
        <p className="subtitle">Créez votre compte pour trouver les meilleurs jobs tech.</p>

        <div className="form-card">
          {error && (
            <div className="error-box" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Formulaire d'inscription">
            <div className="form-group">
              <label htmlFor="register-name" className="form-label">Nom complet</label>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Léon Alligator"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">Adresse Email</label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="leon@epitech.eu"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password" className="form-label">
                Mot de passe
              </label>
              <input
                id="register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                minLength="8"
                autoComplete="new-password"
                aria-describedby="password-hint"
              />
              <span id="password-hint" className="sr-only">
                Le mot de passe doit contenir au moins 8 caractères.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Création en cours...' : 'Lancer ma carrière'}
            </button>
          </form>

          <div className="form-footer">
            Déjà un compte ? <Link to="/login" className="text-green">Se connecter</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
