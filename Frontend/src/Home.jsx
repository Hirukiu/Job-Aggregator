import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './assets/logo.png';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [contractType, setContractType] = useState('');
  const [location, setLocation] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');

    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);

    fetchAnalytics();
  }, []);

  // on recup les stats
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/analytics');
      const resData = await res.json();
      if (res.ok && resData.status === 'success') {
        setAnalytics(resData.data);
      }
    } catch (err) {
      console.error("Impossible de récupérer les statistiques", err);
    }
  };

  // Récup les offres
  const fetchOffers = async () => {
    try {
      let url = 'http://localhost:4000/api/offers?limit=200&';
      if (searchQuery) url += `q=${searchQuery}&`;
      if (location) url += `location=${location}&`;
      if (contractType) url += `contract_type=${contractType}&`;

      const response = await fetch(url);
      const resData = await response.json();

      if (response.ok && resData.status === 'success') {
        setOffers(resData.data);
      }
    } catch (err) {
      console.error("Impossible de récupérer les offres d'emploi", err);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [contractType, location]);

  const handleLogout = () => {
    localStorage.clear();
    setUserName('');
    setUserRole('');
    navigate('/');
  };

  return (
    <div className="page-container">
      {/* Barre de navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span style={{ marginRight: '0.5rem' }}><Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src={Logo}
              alt="JobAlligator Logo"
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
            />
          </Link></span> JobAlligator
        </div>
        <div className="nav-links">
          {userName ? (
            <>
              {userRole === 'ADMIN' && (
                <Link to="/admin" className="nav-link" style={{ fontWeight: 'bold', color: '#2563eb', marginRight: '0.5rem' }}>
                  Espace Admin
                </Link>
              )}

              <Link to="/profile" className="text-green" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
                Bonjour, {userName} !
              </Link>

              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Connexion</Link>
              <Link to="/register" className="btn-nav">S'inscrire</Link>
            </>
          )}
        </div>
      </nav>

      {/* Section recherche*/}
      <main className="hero-section">
        <h1 className="hero-title">Trouvez votre prochain <span className="text-green">Job Tech</span></h1>
        <p className="hero-subtitle">Les meilleures offres, centralisées au même endroit.</p>

        {/* Affichage des compteurs statistiques */}
        {analytics && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">💼</div>
              <p className="stat-value">{analytics.totalOffers}</p>
              <p className="stat-label">Offres actives</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <p className="stat-value">{analytics.remoteRatio?.remote || 0}</p>
              <p className="stat-label">En Télétravail</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <p className="stat-value">
                {analytics.byContractType?.find(c => c.contract_type === 'CDI')?.count || 0}
              </p>
              <p className="stat-label">Postes en CDI</p>
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher un poste (ex: Développeur WEB)..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn" onClick={fetchOffers}>
            Chercher
          </button>
        </div>

        {/* Barre de Filtres */}
        <div className="filters-container">
          <select className="filter-select" value={contractType} onChange={(e) => setContractType(e.target.value)}>
            <option value="">Type de contrat</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Alternance">Alternance</option>
            <option value="Stage">Stage</option>
          </select>

          <select className="filter-select" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Localisation</option>
            <option value="Paris">Paris</option>
            <option value="Lyon">Lyon</option>
            <option value="Bordeaux">Bordeaux</option>
            <option value="Télétravail">Télétravail</option>
          </select>
        </div>

        {/* Section des offres d'emploi */}
        <section className="offers-section">
          <h2 className="offers-title">Offres d'emploi disponibles</h2>

          <div className="offers-list">
            {offers.length > 0 ? (
              offers.map((job) => (
                <div key={job.id} className="offer-card">
                  <div className="offer-info">
                    <h3 className="offer-title-row">{job.title}</h3>
                    <p className="offer-company-row">{job.company} - {job.location}</p>
                    <div className="offer-meta-tags">
                      <span className="badge-contract">{job.contract_type}</span>
                      {job.salary && <span className="tag-location">{job.salary}</span>}
                      <span className="tag-source">⚓ Via {job.source}</span>
                    </div>
                  </div>
                  <div>
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="btn-apply">
                      Postuler
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-offers">
                🐊 Le marais est calme... Aucune offre ne correspond à vos critères pour le moment.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}