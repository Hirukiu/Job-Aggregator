import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="text-5xl hover:opacity-80 transition-opacity">🐊</Link>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-sans">
          Content de vous revoir !
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Connectez-vous pour postuler aux offres.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-6">
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
                Se connecter
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-bold text-green-600 hover:text-green-500">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}