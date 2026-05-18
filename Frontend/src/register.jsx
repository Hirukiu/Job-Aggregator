import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  // Stockage des inputs de l'user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Mémoires pour les messages de succès ou d'erreur
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Outil pour rediriger l'utilisateur vers une autre page
  const navigate = useNavigate();

  // La fonction qui s'active quand on clique sur "lancer ma carrière"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche la page de se recharger
    setError('');
    setIsLoading(true);

    try {
      // appel route register 
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      // si compte crée
      if (response.ok) {
        alert('🐊 Bienvenue dans le marais ! Compte créé avec succès.');
        navigate('/login'); // envoie a page login
      } else {
        // si erreur
        setError(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      setError("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Bouton Retour */}
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-5xl hover:opacity-80 transition-opacity">🐊</Link>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-sans">Rejoignez le marais !</h2>
        <p className="mt-2 text-sm text-gray-600">Créez votre compte pour trouver les meilleurs jobs tech.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-3xl sm:px-10 border border-gray-100">
          
          {/* gestion des erreurs*/}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* liaison du formulaire avec la fonction handlesubmit */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Nom complet</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)} // Met à jour la mémoire
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Léon Alligator"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Adresse Email</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Met à jour la mémoire
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="leon@epitech.eu"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Mot de passe</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Met à jour la mémoire
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                minLength="8"
              />
            </div>

            <div>
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white transition-colors ${isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isLoading ? 'Création en cours...' : 'Lancer ma carrière'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-green-600 hover:text-green-500">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}