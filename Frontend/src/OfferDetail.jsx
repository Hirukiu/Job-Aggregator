import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function OfferDetail() {
  const { id } = useParams(); 
  const [offer, setOffer] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOfferDetail = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/offers/${id}`);
        const data = await res.json();
        
        if (res.ok && data.status === 'success') {
          setOffer(data.data);
        } else {
          setError(data.message || "Offre introuvable.");
        }
      } catch (err) {
        setError("Erreur lors de la connexion au serveur.");
      }
    };

    fetchOfferDetail();
  }, [id]);

  if (error) {
    return (
      <div className="page-container message-container">
        <p className="error-text" role="alert">{error}</p>
        <Link to="/" className="btn-apply btn-return">Retour à l'accueil</Link>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="page-container loading-container" aria-live="polite">
        Chargement des détails de l'offre... 
      </div>
    );
  }

  return (
    <div className="page-container offer-detail-page">
      {/* Navbar */}
      <nav className="navbar" aria-label="Navigation secondaire">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <span aria-hidden="true" style={{ marginRight: '0.5rem' }}>🐊</span> JobAlligator
        </Link>
        <Link to="/" className="nav-link">Retour aux offres</Link>
      </nav>

      {/* Contenu de la fiche de poste */}
      <main className="offer-main">
        <div className="offer-card-detail">
          
          <span className="badge-contract badge-contract-detail">
            {offer.contract_type}
          </span>
          
          <h1 className="offer-title">{offer.title}</h1>
          <p className="offer-company">{offer.company} — {offer.location}</p>

          {/* Badges infos */}
          <div className="offer-badges-container">
            {offer.salary && (
              <span className="badge-salary">
                <span aria-hidden="true"></span> {offer.salary}
              </span>
            )}
            <span className="badge-source">
              <span aria-hidden="true"></span> Source : {offer.source}
            </span>
            {offer.remote === 1 && (
              <span className="badge-remote">
                <span aria-hidden="true">🏠</span> Télétravail 
              </span>
            )}
          </div>

         {/* La description */}
          <h2 className="offer-description-title">Description du poste</h2>
          <div className="markdown-content">
            {offer.description ? (
              <ReactMarkdown>
                {offer.description
                  .replace(/\\n/g, '\n')
                  .replace(/\\/g, '')
                  .replace(/\n/g, '  \n')
                }
              </ReactMarkdown>
            ) : (
              <p>Aucune description détaillée n'a été fournie pour ce poste.</p>
            )}
          </div>
          
          {/* Bouton de redirection finale */}
          <a 
            href={offer.apply_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-apply btn-apply-large" 
          >
            Postuler directement sur {offer.source} 
          </a>
          
        </div>
      </main>
    </div>
  );
}