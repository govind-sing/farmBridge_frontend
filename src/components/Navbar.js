// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link 
          to="/" 
          className="text-lg font-semibold text-gray-900 tracking-tight"
        >
          AgriMarket
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Products
          </Link>
          <Link 
            to="/profile" 
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Profile
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;