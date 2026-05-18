import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
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
     
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      //si succes
      if (response.ok) {
        localStorage.setItem('token', data.token); 
        navigate('/'); 
      } else {
        setError(data.message || 'Email ou mot de passe incorrect.');
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
        <Link to="/" className="logo-emoji">🐊</Link>
        <h2 className="title">Content de vous revoir !</h2>
        <p className="subtitle">Connectez-vous pour postuler aux offres.</p>

        <div className="form-card">
          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
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
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="form-footer">
            Pas encore de compte ? <Link to="/register" className="text-green">S'inscrire</Link>
          </div>
        </div>
      </div>
    </div>
  );
}