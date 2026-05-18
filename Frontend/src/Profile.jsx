import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    // On récupère les infos stockées lors du login
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setUser({
      name: localStorage.getItem('userName') || 'Utilisateur inconnu',
      email: localStorage.getItem('userEmail') || 'Email non renseigné',
      role: localStorage.getItem('userRole') || 'USER'
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/');
  };

  return (
    <div className="page-container" style={{ backgroundColor: '#f9fafb' }}>
      
      {/* Barre de navigation simple */}
      <nav className="navbar">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <span style={{ marginRight: '0.5rem' }}>🐊</span> JobAlligator
        </Link>
        <Link to="/" className="nav-link">Retour aux offres</Link>
      </nav>

      <div className="profile-container">
        <div className="profile-card">
          <span className="profile-avatar">👤</span>
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          
          <span className={`profile-role-badge ${user.role === 'ADMIN' ? 'admin' : ''}`}>
            Rôle : {user.role}
          </span>

          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <h2 className="profile-section-title">Mes candidatures</h2>
            <div className="empty-state">
              Vous n'avez pas encore postulé à des offres depuis JobAlligator.
            </div>
          </div>

          <button onClick={handleLogout} className="btn-danger">
            Me déconnecter
          </button>
        </div>
      </div>

    </div>
  );
}