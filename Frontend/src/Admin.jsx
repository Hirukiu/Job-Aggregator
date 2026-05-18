import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState('');

  // La fonction qui gere la recuperation des offres
  const handleImportWeLoveDevs = async () => {
    setIsImporting(true);
    setMessage('Importation en cours... ');

   
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage("Erreur : Vous n'êtes pas connecté.");
      setIsImporting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/ingestion/welovedevs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: 0, q: "javascript", size: 20 })
      });

      const data = await response.json();

      if (response.status === 201) {
        setMessage(`Succès ! ${data.data.imported} nouvelles offres importées dans le marais.`);
      } else {
        setMessage(`Erreur ${response.status} : ${data.message}`);
      }
    } catch (err) {
      setMessage("Impossible de contacter le serveur backend.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="page-container" style={{ backgroundColor: '#f3f4f6' }}>
      
      {/* Navbar Admin foncée */}
      <nav className="admin-navbar">
        <div className="admin-nav-brand">
          <span style={{ marginRight: '0.5rem' }}></span> JobAlligator 
          <span className="admin-badge">ADMIN</span>
        </div>
        <Link to="/" className="admin-nav-link">Retour au site</Link>
      </nav>

      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des offres d'emploi</h1>
          
          {/* Bouton importation*/}
          <button 
            onClick={handleImportWeLoveDevs} 
            disabled={isImporting}
            style={{ backgroundColor: isImporting ? '#9ca3af' : '#2563eb' }}
            className="btn-add"
          >
            {isImporting ? 'Aspiration en cours...' : 'Importer WeLoveDevs'}
          </button>
        </div>

        {/* Affichage du résultat de l'importation */}
        {message && (
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', fontWeight: 'bold', color: message.includes('X') ? '#dc2626' : '#16a34a', border: '1px solid #e5e7eb' }}>
            {message}
          </div>
        )}

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre du poste</th>
                <th>Entreprise</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="job-title">Développeur React Junior</td>
                <td>TechCorp</td>
                <td><span className="badge-contract">CDI</span></td>
                <td className="action-btns">
                  <button className="btn-edit">Éditer</button>
                  <button className="btn-delete">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="table-footer">
            Ceci est l'interface d'administration. Les données réelles arriveront bientôt.
          </div>
        </div>
      </main>
    </div>
  );
}