import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de navigation */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="text-green-700 font-bold text-2xl flex items-center">
          <span className="mr-2">🐊</span> JobAlligator
        </div>
        <div className="space-x-6 text-sm font-medium">
          <Link to="/login" className="text-gray-600 hover:text-green-600">Connexion</Link>
          <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700">S'inscrire</Link>
        </div>
      </nav>

      {/* Section Hero (Recherche) */}
      <main className="max-w-4xl mx-auto pt-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          Trouvez votre prochain <span className="text-green-600">Job Tech</span>
        </h1>
        <p className="text-gray-600 text-xl mb-10">
          Les meilleures offres, centralisées au même endroit.
        </p>

        {/* Barre de recherche */}
        <div className="bg-white p-2 rounded-2xl shadow-xl flex border border-gray-100">
          <input 
            type="text" 
            placeholder="Rechercher un poste (ex: Développeur React)..." 
            className="flex-1 px-6 py-4 outline-none text-gray-700 rounded-l-2xl"
          />
          <button className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition-colors">
            Chercher
          </button>
        </div>

        {/* Barre de Filtres */}
        <div className="max-w-4xl mx-auto mt-6 px-4 flex flex-wrap justify-center gap-4">
          <select className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none shadow-sm cursor-pointer">
            <option>Type de contrat</option>
            <option>CDI</option>
            <option>CDD</option>
            <option>Alternance</option>
            <option>Stage</option>
          </select>

          <select className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none shadow-sm cursor-pointer">
            <option>Localisation</option>
            <option>Paris</option>
            <option>Lyon</option>
            <option>Bordeaux</option>
            <option>Télétravail</option>
          </select>

          <select className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none shadow-sm cursor-pointer">
            <option>Salaire minimum</option>
            <option>30k€+</option>
            <option>40k€+</option>
            <option>50k€+</option>
          </select>
        </div>

        {/* Liens de développement (à retirer en production) */}
        <div className="mt-16 p-4 bg-green-50 rounded-2xl border border-green-100 inline-block text-sm">
          <p className="text-green-800 font-bold mb-2">🛠️ Menu de Test Rapide :</p>
          <div className="space-x-4">
            <Link to="/admin" className="text-green-700 underline">Espace Admin</Link>
          </div>
        </div>
      </main>
    </div>
  );
}