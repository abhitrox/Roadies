import React, { useState } from 'react';
import { authAPI } from '../services/api';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      if (response.data.success) {
        onLogin(response.data.user);
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const mockUser = { 
      id: 1, 
      email: 'user@gmail.com', 
      name: 'G',
      token: 'mock-token-' + Date.now()
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            →
          </div>
          <span className="text-2xl font-bold text-gray-900">Roadies</span>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Compare predicted fares near you in seconds.
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-300 rounded-lg px-5 py-3 font-semibold text-gray-900 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-400 transition-all mb-4"
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5">
            <path fill="#4285F4" d="M19.6 10.23c0-.68-.06-1.34-.17-1.97H10v3.73h5.41a4.62 4.62 0 0 1-2 3.03v2.52h3.24C18.34 15.9 19.6 13.26 19.6 10.23z"/>
            <path fill="#34A853" d="M10 20c2.7 0 4.96-.9 6.61-2.43l-3.24-2.52c-.9.6-2.04.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H1.07v2.6A9.99 9.99 0 0 0 10 20z"/>
            <path fill="#FBBC05" d="M4.44 11.91A6.06 6.06 0 0 1 4.13 10c0-.66.11-1.3.31-1.91V5.49H1.07A10 10 0 0 0 0 10c0 1.61.38 3.13 1.07 4.51l3.37-2.6z"/>
            <path fill="#EA4335" d="M10 3.98c1.46 0 2.77.5 3.8 1.49l2.85-2.85C14.95.99 12.7 0 10 0A9.99 9.99 0 0 0 1.07 5.49l3.37 2.6C5.22 5.73 7.41 3.98 10 3.98z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6 text-sm text-gray-500">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span>or sign in with email</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-lg px-5 py-3 font-bold text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
          By continuing you agree to our <a href="#" className="text-gray-900 font-bold hover:underline">Terms</a> and <a href="#" className="text-gray-900 font-bold hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default LoginForm;