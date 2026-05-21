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
  const [messageType, setMessageType] = useState('success'); // 'success' | 'error'
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

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchOffers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/offers?limit=200', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOffers(data.data || []);
      else showMessage(`Erreur: ${data.message}`, 'error');
    } catch (err) {
      showMessage("Erreur de connexion au serveur.", 'error');
    }
  };

  const toggleOfferStatus = async (id, currentStatus, title) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/offers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchOffers();
        showMessage(`Offre "${title}" ${!currentStatus ? 'activée' : 'désactivée'}.`, 'success');
      } else {
        showMessage("Impossible de modifier le statut.", 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOffer = async (id, title) => {
    if (!window.confirm(`Supprimer définitivement l'offre "${title}" ?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/admin/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchOffers();
        showMessage(`Offre "${title}" supprimée.`, 'success');
      } else {
        showMessage("Impossible de supprimer l'offre.", 'error');
      }
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

  const toggleUserRole = async (id, currentRole, name) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers();
        showMessage(`Rôle de "${name}" changé en ${newRole}.`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Bannir "${name}" du marais ?`)) return;
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
        showMessage(`Utilisateur "${name}" supprimé.`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportWeLoveDevs = async () => {
    setIsImporting(true);
    showMessage(`Aspiration de la page ${importPage}…`, 'success');
    try {
      const response = await fetch('http://localhost:4000/api/ingestion/welovedevs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: importPage, size: 20 })
      });
      if (response.status === 429) {
        showMessage('Trop de requêtes, attendez un moment avant de réessayer.', 'error');
        return;
      }
      const data = await response.json();
      if (response.status === 201) {
        showMessage(`Succès ! ${data.data.imported} nouvelles offres importées (Page ${importPage}).`, 'success');
        setImportPage(prev => prev + 1);
        if (activeTab === 'offers') fetchOffers();
      } else {
        showMessage(`Erreur ${response.status} : ${data.message}`, 'error');
      }
    } catch (err) {
      showMessage("Impossible de contacter le backend.", 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="page-container">
      <nav className="admin-navbar" aria-label="Navigation administration">
        <div className="admin-nav-brand">
          <Link to="/" aria-label="JobAlligator – retour au site" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src={Logo}
              alt=""
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          {' '}JobAlligator
          <span className="admin-badge" aria-label="Interface administration">ADMIN</span>
        </div>
        <Link to="/" className="admin-nav-link">Retour au site</Link>
      </nav>

      <main id="main-content" className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Panneau de contrôle</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleImportWeLoveDevs}
              disabled={isImporting}
              aria-busy={isImporting}
              aria-label={isImporting ? 'Importation en cours, veuillez patienter' : `Importer les offres WeLoveDevs – page ${importPage}`}
              className="btn-add"
            >
              {isImporting ? 'Aspiration...' : `Importer plus d'offres (Page ${importPage})`}
            </button>
          </div>
        </div>

        {/* Message de retour – role="alert" pour les erreurs, role="status" pour les succès */}
        {message && (
          <div
            className={`admin-message-box ${messageType === 'error' ? 'error' : 'success'}`}
            role={messageType === 'error' ? 'alert' : 'status'}
            aria-live={messageType === 'error' ? 'assertive' : 'polite'}
          >
            {message}
            <button
              type="button"
              onClick={() => setMessage('')}
              className="btn-close-message"
              aria-label="Fermer le message"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}

        {/* Onglets ARIA */}
        <div
          role="tablist"
          aria-label="Sections d'administration"
          className="tabs-container"
        >
          <button
            type="button"
            role="tab"
            id="tab-offers"
            aria-selected={activeTab === 'offers'}
            aria-controls="panel-offers"
            onClick={() => setActiveTab('offers')}
            className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
          >
            Gérer les Offres ({offers.length})
          </button>
          <button
            type="button"
            role="tab"
            id="tab-users"
            aria-selected={activeTab === 'users'}
            aria-controls="panel-users"
            onClick={() => setActiveTab('users')}
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          >
            Gérer les Utilisateurs
          </button>
        </div>

        {/* Panneau Offres */}
        {activeTab === 'offers' && (
          <div
            role="tabpanel"
            id="panel-offers"
            aria-labelledby="tab-offers"
            className="table-wrapper"
          >
            <table className="admin-table" aria-label="Liste des offres">
              <thead>
                <tr>
                  <th scope="col">Titre</th>
                  <th scope="col">Entreprise</th>
                  <th scope="col">Statut</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
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
                      <button
                        type="button"
                        onClick={() => toggleOfferStatus(o.id, o.is_active, o.title)}
                        className="btn-edit"
                        aria-label={`${o.is_active ? 'Désactiver' : 'Activer'} l'offre "${o.title}"`}
                      >
                        {o.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteOffer(o.id, o.title)}
                        className="btn-delete"
                        aria-label={`Supprimer l'offre "${o.title}"`}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Aucune offre trouvée.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {offers.length > offersPerPage && (
              <nav aria-label="Pagination des offres" className="pagination-container">
                <button
                  type="button"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  aria-label="Page précédente"
                >
                  Précédent
                </button>

                <span className="pagination-text" aria-live="polite" aria-atomic="true">
                  <span className="sr-only">Page courante :</span>
                  {' '}{currentPage} sur {totalPages}
                </span>

                <button
                  type="button"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  aria-label="Page suivante"
                >
                  Suivant
                </button>
              </nav>
            )}
          </div>
        )}

        {/* Panneau Utilisateurs */}
        {activeTab === 'users' && (
          <div
            role="tabpanel"
            id="panel-users"
            aria-labelledby="tab-users"
            className="table-wrapper"
          >
            <table className="admin-table" aria-label="Liste des utilisateurs">
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">Email</th>
                  <th scope="col">Rôle</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
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
                      <button
                        type="button"
                        onClick={() => toggleUserRole(u.id, u.role, u.name)}
                        className="btn-edit"
                        aria-label={`Changer le rôle de ${u.name} (actuellement ${u.role})`}
                      >
                        Changer Rôle
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(u.id, u.name)}
                        className="btn-delete"
                        aria-label={`Bannir l'utilisateur ${u.name}`}
                      >
                        Bannir
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Aucun utilisateur.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
