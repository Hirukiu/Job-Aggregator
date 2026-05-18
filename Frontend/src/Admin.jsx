import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminPage() {
  return (
    <div className="page-container" style={{ backgroundColor: '#f3f4f6' }}>
      
      {/* Navbar Admin */}
      <nav className="admin-navbar">
        <div className="admin-nav-brand">
          <span style={{ marginRight: '0.5rem' }}>🐊</span> JobAlligator 
          <span className="admin-badge">ADMIN</span>
        </div>
        <Link to="/" className="admin-nav-link">Retour au site</Link>
      </nav>

      {/* Contenu principal de l'admin */}
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Gestion des offres d'emploi</h1>
          <button className="btn-add">+ Nouvelle offre</button>
        </div>

        {/* Le tableau */}
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
            Ceci est une interface d'exemple. Les données réelles arriveront avec le backend !
          </div>
        </div>
      </main>
      
    </div>
  );
}