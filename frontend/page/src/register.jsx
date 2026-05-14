import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-4xl">🐊</span>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join JobAlligator and find your dream job today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5">
            {/* Nom Complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="Jean Dupont"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" 
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input 
                type="email" 
                required 
                placeholder="jean@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" 
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" 
              />
            </div>

            {/*  Conditions */}
            <div className="flex items-center">
              <input 
                id="terms" 
                type="checkbox" 
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the <span className="text-green-600 hover:underline cursor-pointer">Terms and Conditions</span>
              </label>
            </div>

            {/*  validation */}
            <div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}