import React, { useState, useEffect } from 'react';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('offers');

    // States pour stocker les données du backend
    const [offers, setOffers] = useState([]);
    const [users, setUsers] = useState([]);

    // liaison backend
    useEffect(() => {
        // Route de Mathieu
        /*
        fetch('http://localhost:4000/api/admin/offers')
          .then(res => res.json())
          .then(data => setOffers(data));
          
        fetch('http://localhost:4000/api/admin/users')
          .then(res => res.json())
          .then(data => setUsers(data));
        */
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">


            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <div className="flex items-center text-green-700 font-bold text-xl">
                        <span className="mr-2">🐊</span> JobAlligator.com
                    </div>
                    {/* Responsivité */}
                    <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-500">
                        <a href="#" className="hover:text-green-600">Discover job offers</a>
                        <a href="#" className="hover:text-green-600">Browse companies</a>
                        <a href="#" className="hover:text-green-600">Profile</a>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-green-800 bg-green-100 border border-green-300 px-3 py-1 rounded-full">
                        Admin Account
                    </span>
                    <button className="text-sm font-medium border border-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                        Logout
                    </button>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Panneau d'Administration</h1>

                {/* Onglets de navigation */}
                <div className="flex space-x-4 border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('offers')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'offers'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Modérer les offres
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users'
                            ? 'border-green-600 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Gérer les utilisateurs
                    </button>
                </div>

                {/*  Gestion des Offres */}
                {activeTab === 'offers' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poste / Entreprise</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'import</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* exemple en attendant les données */}
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">Senior React Native Developer</div>
                                            <div className="text-sm text-gray-500">TechCorp - Paris</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                WeLoveDevs
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            14 Mai 2026
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-600 hover:text-green-600 mr-4 font-semibold transition-colors">Modifier</button>
                                            <button className="text-gray-600 hover:text-red-600 font-semibold transition-colors">Supprimer</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Gestion des Utilisateurs */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle Actuel</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">thomas.dupont@gmail.com</div>
                                            <div className="text-xs text-gray-500">Inscrit le 12 Mai 2026</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                User
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-600 hover:text-green-600 mr-4 font-semibold transition-colors">Promouvoir Admin</button>
                                            <button className="text-gray-600 hover:text-red-600 font-semibold transition-colors">Bannir</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}