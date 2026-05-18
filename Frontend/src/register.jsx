import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-5xl hover:opacity-80 transition-opacity">🐊</Link>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-sans">
          Rejoignez le marais !
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Créez votre compte pour trouver les meilleurs jobs tech.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Nom complet</label>
              <input 
                type="text" 
                required 
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Léon Alligator"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Adresse Email</label>
              <input 
                type="email" 
                required 
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="leon@epitech.eu"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Mot de passe</label>
              <input 
                type="password" 
                required 
                className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Lancer ma carrière
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-green-600 hover:text-green-500">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}