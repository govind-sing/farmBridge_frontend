// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <div>
      <Navbar /> {/* Navbar will be added in Step 2 */}
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </div>
  );
}

export default App;