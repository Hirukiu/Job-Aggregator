import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-4xl">🐊</span>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or <Link to="/register" className="font-medium text-green-600 hover:text-green-500">create a new account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
            </div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}