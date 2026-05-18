import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('offers'); 
  const [offers, setOffers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      if (activeTab === 'offers') fetchOffers();
      if (activeTab === 'users') fetchUsers();
    }
  }, [activeTab]);

 
  // GET /api/admin/offers
  const fetchOffers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/offers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOffers(data.data || []);
      else setMessage(`Erreur: ${data.message}`);
    } catch (err) {
      setMessage("Erreur de connexion au serveur.");
    }
  };

  // PATCH /api/admin/offers/:id/status
  const toggleOfferStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/offers/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) fetchOffers(); // On rafraîchit la liste
      else setMessage("Impossible de modifier le statut.");
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE /api/admin/offers/:id
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

  // GET /api/admin/users
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data.data || []);
      else setMessage(` Erreur: ${data.message}`);
    } catch (err) {
      console.error(err);
    }
  };

  // PATCH /api/admin/users/:id/role
  const toggleUserRole = async (id, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) fetchUsers();
      else setMessage(`Erreur: ${data.message}`);
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE /api/admin/users/:id
  const deleteUser = async (id) => {
    if (!window.confirm("Bannir cet utilisateur du marais ?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) fetchUsers();
      else setMessage(`Erreur: ${data.message}`);
    } catch (err) {
      console.error(err);
    }
  };

 
  // POST /api/ingestion/welovedevs
  const handleImportWeLoveDevs = async () => {
    setIsImporting(true);
    setMessage('Importation WeLoveDevs en cours... ');
    try {
      const response = await fetch('http://localhost:4000/api/ingestion/welovedevs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 0, q: "javascript", size: 20 })
      });
      const data = await response.json();
      if (response.status === 201) {
        setMessage(` Succès ! ${data.data.imported} nouvelles offres importées.`);
        if (activeTab === 'offers') fetchOffers();
      } else {
        setMessage(` Erreur ${response.status} : ${data.message}`);
      }
    } catch (err) {
      setMessage("Impossible de contacter le backend.");
    } finally {
      setIsImporting(false);
    }
  };

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

      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">Panneau de contrôle</h1>
          <button onClick={handleImportWeLoveDevs} disabled={isImporting} className="btn-add" style={{ backgroundColor: isImporting ? '#9ca3af' : '#2563eb' }}>
            {isImporting ? 'Aspiration en cours...' : ' Importer WeLoveDevs'}
          </button>
        </div>

        {/* Message d'alerte global */}
        {message && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', fontWeight: 'bold', color: message.includes('X') ? '#dc2626' : '#16a34a', border: '1px solid #e5e7eb' }}>
            {message}
            <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
          </div>
        )}

        {/* Système d'onglets */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setActiveTab('offers')} 
            style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'offers' ? '#111827' : 'white', color: activeTab === 'offers' ? 'white' : '#4b5563' }}
          >
             Gérer les Offres
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'users' ? '#111827' : 'white', color: activeTab === 'users' ? 'white' : '#4b5563' }}
          >
            👥 Gérer les Utilisateurs
          </button>
        </div>

        {/* tableau des offres */}
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
                {offers.length > 0 ? offers.map(o => (
                  <tr key={o.id}>
                    <td className="job-title">{o.title}</td>
                    <td>{o.company}</td>
                    <td>
                      <span style={{ backgroundColor: o.is_active ? '#dcfce3' : '#fee2e2', color: o.is_active ? '#166534' : '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
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
          </div>
        )}

        {/* Ttableau des utilisateurs */}
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
                      <span style={{ backgroundColor: u.role === 'ADMIN' ? '#fef08a' : '#e5e7eb', color: u.role === 'ADMIN' ? '#854d0e' : '#374151', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
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