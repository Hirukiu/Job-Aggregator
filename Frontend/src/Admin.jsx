import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminPage.css';
import Logo from './assets/logo.png';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('offers');
  const [offers, setOffers] = useState([]);
  const [users, setUsers] = useState([]);

  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [importPage, setImportPage] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 10;

  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = offers.slice(indexOfFirstOffer, indexOfLastOffer);
  const totalPages = Math.ceil(offers.length / offersPerPage);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      if (activeTab === 'offers') {
        fetchOffers();
        setCurrentPage(1);
      }
      if (activeTab === 'users') fetchUsers();
    }
  }, [activeTab, token, navigate]);

  const fetchOffers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/offers?limit=200', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOffers(data.data || []);
      else setMessage(` Erreur: ${data.message}`);
    } catch (err) {
      setMessage(" Erreur de connexion au serveur.");
    }
  };

  const toggleOfferStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/offers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) fetchOffers();
      else setMessage("Impossible de modifier le statut.");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("Sûr de vouloir supprimer cette offre définitivement ?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/admin/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchOffers();
      else setMessage("Impossible de supprimer l'offre.");
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserRole = async (id, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Bannir cet utilisateur du marais ?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportWeLoveDevs = async () => {
    setIsImporting(true);
    setMessage(`Aspiration de la page ${importPage}... `);
    try {
      const response = await fetch('http://localhost:4000/api/ingestion/welovedevs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: importPage, size: 20 })
      });
      const data = await response.json();
      if (response.status === 201) {
        setMessage(`Succès ! ${data.data.imported} nouvelles offres importées (Page ${importPage}).`);
        setImportPage(prev => prev + 1);
        if (activeTab === 'offers') fetchOffers();
      } else {
        setMessage(`Erreur ${response.status} : ${data.message}`);
      }
    } catch (err) {
      setMessage("Impossible de contacter le backend.");
    } finally {
      setIsImporting(false);
    }
  };

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="page-container">
      <nav className="admin-navbar">
        <div className="admin-nav-brand">
          <span><Link to="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src={Logo}
              alt="JobAlligator Logo"
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
            />
          </Link></span> JobAlligator
          <span className="admin-badge">ADMIN</span>
        </div>
        <Link to="/" className="admin-nav-link">Retour au site</Link>
      </nav>

      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Panneau de contrôle</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>

            <button onClick={handleImportWeLoveDevs} disabled={isImporting} className="btn-add">
              {isImporting ? 'Aspiration...' : `Importer plus d'offres (Page ${importPage})`}
            </button>
          </div>
        </div>

        {message && (
          <div className={`admin-message-box ${message.includes('Erreur') ? 'error' : 'success'}`}>
            {message}
            <button onClick={() => setMessage('')} className="btn-close-message">X</button>
          </div>
        )}

        <div className="tabs-container">
          <button
            onClick={() => setActiveTab('offers')}
            className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
          >
            Gérer les Offres ({offers.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            Gérer les Utilisateurs
          </button>
        </div>

        {activeTab === 'offers' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Entreprise</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOffers.length > 0 ? currentOffers.map(o => (
                  <tr key={o.id}>
                    <td className="job-title">{o.title}</td>
                    <td>{o.company}</td>
                    <td>
                      <span className={`status-badge ${o.is_active ? 'active' : 'inactive'}`}>
                        {o.is_active ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </td>
                    <td className="action-btns">
                      <button onClick={() => toggleOfferStatus(o.id, o.is_active)} className="btn-edit">
                        {o.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => deleteOffer(o.id)} className="btn-delete">Supprimer</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Aucune offre trouvée.</td></tr>}
              </tbody>
            </table>

            {offers.length > offersPerPage && (
              <div className="pagination-container">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Précédent
                </button>

                <span className="pagination-text">
                  Page {currentPage} sur {totalPages}
                </span>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map(u => (
                  <tr key={u.id}>
                    <td className="job-title">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="action-btns">
                      <button onClick={() => toggleUserRole(u.id, u.role)} className="btn-edit">
                        Changer Rôle
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="btn-delete">Bannir</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Aucun utilisateur.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}