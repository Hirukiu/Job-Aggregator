import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-container">
      {/* Barre de navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span style={{ marginRight: '0.5rem' }}>🐊</span> JobAlligator
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Connexion</Link>
          <Link to="/register" className="btn-nav">S'inscrire</Link>
        </div>
      </nav>

      {/* Section Recherche */}
      <main className="hero-section">
        <h1 className="hero-title">
          Trouvez votre prochain <span className="text-green">Job Tech</span>
        </h1>
        <p className="hero-subtitle">
          Les meilleures offres, centralisées au même endroit.
        </p>

        {/* Barre de recherche */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Rechercher un poste (ex: Développeur React)..." 
            className="search-input"
          />
          <button className="search-btn">
            Chercher
          </button>
        </div>

        {/* Barre de Filtres */}
        <div className="filters-container">
          <select className="filter-select">
            <option>Type de contrat</option>
            <option>CDI</option>
            <option>CDD</option>
            <option>Alternance</option>
            <option>Stage</option>
          </select>

          <select className="filter-select">
            <option>Localisation</option>
            <option>Paris</option>
            <option>Lyon</option>
            <option>Bordeaux</option>
            <option>Télétravail</option>
          </select>

          <select className="filter-select">
            <option>Salaire minimum</option>
            <option>30k€+</option>
            <option>40k€+</option>
            <option>50k€+</option>
          </select>
        </div>

        
        <div className="debug-menu">
          <p className="text-green" style={{ margin: '0 0 0.5rem 0' }}>Menu :</p>
          <div>
            <Link to="/admin" className="text-green" style={{ textDecoration: 'underline' }}>
              Espace Admin
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}