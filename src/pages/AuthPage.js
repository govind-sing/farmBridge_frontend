// Minimalist Auth Page Redesign
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../apiAxios';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register(formData);

      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6">

        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center mb-4">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (
            <div>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
            />
          </div>

          {!isLogin && (
            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
              >
                <option value="buyer">Buyer</option>
                <option value="community">Seller</option>
              </select>
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>

        </form>

        {/* Switch */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "No account?" : "Already have one?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
            className="text-gray-900 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>

      </div>
    </div>
  );
}

export default AuthPage;