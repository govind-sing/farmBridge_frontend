// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-green-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Agri Market</Link>
        <div className="space-x-4">
          <Link to="/" className="text-white hover:text-gray-200">Products</Link>
          <Link to="/profile" className="text-white hover:text-gray-200">Profile</Link>
          <Link to="/plant" className="text-white hover:text-gray-200">Plant Info</Link>
          <Link to="/food" className="text-white hover:text-gray-200">Food Info</Link>
          {/* Placeholder for Ingredient Analyzer */}
          <Link to="/ingredient" className="text-white hover:text-gray-200">Ingredient Analyzer</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;