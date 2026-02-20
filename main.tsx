import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import GreaseTrapCleaningLA from './pages/GreaseTrapCleaningLA';
import UsedCookingOilPickupLA from './pages/UsedCookingOilPickupLA';
import RestroomTrailerRentalsLA from './pages/RestroomTrailerRentalsLA';
import RestaurantWasteServicesLA from './pages/RestaurantWasteServicesLA';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/grease-trap-cleaning-los-angeles" element={<GreaseTrapCleaningLA />} />
        <Route path="/used-cooking-oil-pickup-los-angeles" element={<UsedCookingOilPickupLA />} />
        <Route path="/restroom-trailer-rentals-los-angeles" element={<RestroomTrailerRentalsLA />} />
        <Route path="/restaurant-waste-services" element={<RestaurantWasteServicesLA />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
