import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './assets/logo.png';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contractType, setContractType] = useState('');
  const [location, setLocation] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedRole = localStorage.getItem('userRole');

    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole);

    fetchAnalytics();
  }, []);

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

  const fetchOffers = async () => {
    setIsLoadingOffers(true);
    try {
      let url = 'http://localhost:4000/api/offers?limit=200&';
      if (searchQuery) url += `q=${encodeURIComponent(searchQuery)}&`;
      if (location) url += `location=${encodeURIComponent(location)}&`;
      if (contractType) url += `contract_type=${encodeURIComponent(contractType)}&`;
      if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;

      const response = await fetch(url);
      const resData = await response.json();

      if (response.ok && resData.status === 'success') {
        setOffers(resData.data);
      }
    } catch (err) {
      console.error("Impossible de récupérer les offres d'emploi", err);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [contractType, location, selectedCategory]);

  const handleLogout = () => {
    localStorage.clear();
    setUserName('');
    setUserRole('');
    navigate('/');
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchOffers();
    }
  };

  return (
    <div className="page-container">
      {/* Barre de navigation */}
      <nav className="navbar" aria-label="Navigation principale">
        <div className="nav-brand">
          <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src={Logo}
              alt="JobAlligator Logo"
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
            />JobAlligator
          </Link>
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

              <button
                type="button"
                onClick={handleLogout}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
              >
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

      {/* Section Héro */}
      <main id="main-content" className="hero-section">
        <h1 className="hero-title">Trouvez votre prochain <span className="text-green">Job Tech</span></h1>
        <p className="hero-subtitle">Les meilleures offres, centralisées au même endroit.</p>

        {/* Compteurs Statistiques */}
        {analytics && (
          <div className="stats-container" role="region" aria-label="Statistiques du marché">
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">💼</div>
              <p className="stat-value">{analytics.totalOffers}</p>
              <p className="stat-label">Offres actives</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">🏠</div>
              <p className="stat-value">{analytics.remoteRatio?.remote || 0}</p>
              <p className="stat-label">En Télétravail</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">🔥</div>
              <p className="stat-value">
                {analytics.byContractType?.find(c => c.contract_type === 'CDI')?.count || 0}
              </p>
              <p className="stat-label">Postes en CDI</p>
            </div>
          </div>
        )}

        {/* Widget IA - Catégories */}
        {analytics?.byCategory?.length > 0 && (
          <div className="category-widget" role="region" aria-label="Offres par domaine, classifiées par IA">
            <div className="category-widget-header">
              <h2 className="category-widget-title">Offres par domaine</h2>
              <span className="category-widget-badge">Classifié par IA</span>
            </div>
            <div className="category-pills" role="group" aria-label="Filtrer par domaine">
              <button
                className={`category-pill${selectedCategory === '' ? ' active' : ''}`}
                onClick={() => setSelectedCategory('')}
                aria-pressed={selectedCategory === ''}
              >
                Tous
                <span className="category-pill-count">({analytics.totalOffers})</span>
              </button>
              {analytics.byCategory
                .filter(c => c.category && c.category !== 'Autre')
                .sort((a, b) => b.count - a.count)
                .map(c => (
                  <button
                    key={c.category}
                    className={`category-pill${selectedCategory === c.category ? ' active' : ''}`}
                    onClick={() => setSelectedCategory(prev => prev === c.category ? '' : c.category)}
                    aria-pressed={selectedCategory === c.category}
                  >
                    {c.category}
                    <span className="category-pill-count">({c.count})</span>
                  </button>
                ))
              }
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <form
          role="search"
          aria-label="Recherche d'offres d'emploi"
          className="search-container"
          onSubmit={(e) => { e.preventDefault(); fetchOffers(); }}
        >
          <label htmlFor="search-input" className="sr-only">Rechercher un poste par mot-clé</label>
          <input
            id="search-input"
            type="search"
            placeholder="Rechercher un poste (ex: Développeur React)..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button type="submit" className="search-btn" aria-label="Lancer la recherche">
            Chercher
          </button>
        </form>

        {/* Barre de Filtres */}
        <div className="filters-container" role="group" aria-label="Filtres de recherche">
          <label htmlFor="filter-contract" className="sr-only">Filtrer par type de contrat</label>
          <select
            id="filter-contract"
            className="filter-select"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
          >
            <option value="">Type de contrat</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Alternance">Alternance</option>
            <option value="Stage">Stage</option>
          </select>

          <label htmlFor="filter-location" className="sr-only">Filtrer par localisation</label>
          <select
            id="filter-location"
            className="filter-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Localisation</option>
            <option value="Paris">Paris</option>
            <option value="Lyon">Lyon</option>
            <option value="Bordeaux">Bordeaux</option>
            <option value="Télétravail">Télétravail</option>
          </select>
        </div>

        {/* Section des offres d'emploi */}
        <section className="offers-section" aria-label="Liste des offres d'emploi">
          <h2 className="offers-title">Offres d'emploi disponibles</h2>

          {/* Annonce du nombre de résultats aux lecteurs d'écran */}
          <p
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {isLoadingOffers
              ? 'Chargement des offres en cours...'
              : `${offers.length} offre${offers.length !== 1 ? 's' : ''} trouvée${offers.length !== 1 ? 's' : ''}`
            }
          </p>

          <div className="offers-list">
            {offers.length > 0 ? (
              offers.map((job) => (
                <div key={job.id} className="offer-card">
                  <div className="offer-info">
                    <h3 className="offer-title-row">
                      <Link
                        to={`/offers/${job.id}`}
                        className="offer-title-link"
                        aria-label={`Voir le détail du poste de ${job.title} chez ${job.company}`}
                      >
                        {job.title}
                      </Link>
                    </h3>
                    <p className="offer-company-row">{job.company} - {job.location}</p>
                    <div className="offer-meta-tags">
                      <span className="badge-contract">{job.contract_type}</span>
                      {job.salary && (
                        <span className="tag-location">
                          <span aria-hidden="true"></span> {job.salary}
                        </span>
                      )}
                      <span className="tag-source">
                        <span aria-hidden="true"></span> Via {job.source}
                      </span>
                    </div>
                  </div>
                  <div>
                    {/* Ce lien est aria-hidden car le titre ci-dessus couvre déjà la navigation */}
                    <Link
                      to={`/offers/${job.id}`}
                      className="btn-apply"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                      aria-hidden="true"
                      tabIndex="-1"
                    >
                      Voir l'offre
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-offers" role="status" aria-live="polite">
                {isLoadingOffers
                  ? 'Chargement des offres...'
                  : 'Le marais est calme... Aucune offre ne correspond à vos critères pour le moment.'
                }
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
