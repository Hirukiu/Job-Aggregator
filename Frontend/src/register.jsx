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
        <svg className="back-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Retour à l'accueil
      </Link>

      <div className="center-content">
        <div className="nav-brand">
          <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src={Logo}
              alt="JobAlligator Logo"
              style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
            />JobAlligator
          </Link>
        </div>
        <h2 className="title">Rejoignez le marais !</h2>
        <p className="subtitle">Créez votre compte pour trouver les meilleurs jobs tech.</p>

        <div className="form-card">
          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Léon Alligator"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="leon@epitech.eu"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                minLength="8"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Création en cours...' : 'Lancer ma carrière'}
            </button>
          </form>

          <div className="form-footer">
            Déjà un compte ? <Link to="/login" className="text-green">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}