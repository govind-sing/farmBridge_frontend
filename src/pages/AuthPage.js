// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for better navigation
import { register, login } from '../apiAxios';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  });
  const [error, setError] = useState(null); // Added for error display
  const [loading, setLoading] = useState(false); // Added for loading state
  const navigate = useNavigate(); // Added for React Router navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Show loading state
    try {
      const res = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register(formData);
      localStorage.setItem('token', res.data.token);
      setLoading(false);
      navigate('/'); // Use navigate instead of window.location.href
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
      console.error('Auth error:', err.response?.data || err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading && <p className="text-gray-600 mb-4">Loading...</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                disabled={loading}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-gray-700">Role:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="buyer">Buyer</option>
                <option value="community">Community (Seller)</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white ${
              loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;