// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import PlantPage from './pages/PlantPage'; // Placeholder for Plant Info
import FoodPage from './pages/FoodPage';   // Placeholder for Food Info
import AuthPage from './pages/AuthPage';   // Placeholder for Login
import Navbar from './components/Navbar';
import IngredientsPage from './pages/IngredientsPage';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <div>
      <Navbar /> {/* Navbar will be added in Step 2 */}
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/plant" element={<PlantPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/ingredient" element={<IngredientsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </div>
  );
}

export default App;