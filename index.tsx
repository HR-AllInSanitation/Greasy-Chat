
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import GreaseTrapCleaningLA from './pages/GreaseTrapCleaningLA';
import UsedCookingOilPickupLA from './pages/UsedCookingOilPickupLA';
import RestroomTrailerRentalsLA from './pages/RestroomTrailerRentalsLA';
import RestaurantWasteServicesLA from './pages/RestaurantWasteServicesLA';
import SepticHoldingTankPumpingLA from './pages/SepticHoldingTankPumpingLA';
import HydroJettingLA from './pages/HydroJettingLA';
import ComplianceAuditsLA from './pages/ComplianceAuditsLA';
import HoodCleaningLA from './pages/HoodCleaningLA';
import JanitorialServicesLA from './pages/JanitorialServicesLA';
import FAQPage from './pages/FAQ';
import AboutUs from './pages/AboutUs';
import BestPractices from './pages/BestPractices';
import EnvironmentalImpact from './pages/EnvironmentalImpact';
import InstantEstimate from './pages/InstantEstimate';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/grease-trap-cleaning-los-angeles" element={<GreaseTrapCleaningLA />} />
        <Route path="/used-cooking-oil-pickup-los-angeles" element={<UsedCookingOilPickupLA />} />
        <Route path="/restroom-trailer-rentals-los-angeles" element={<RestroomTrailerRentalsLA />} />
        <Route path="/restaurant-waste-services" element={<RestaurantWasteServicesLA />} />
        <Route path="/septic-holding-tank-pumping-los-angeles" element={<SepticHoldingTankPumpingLA />} />
        <Route path="/hydro-jetting-los-angeles" element={<HydroJettingLA />} />
        <Route path="/compliance-audits-los-angeles" element={<ComplianceAuditsLA />} />
        <Route path="/hood-cleaning-los-angeles" element={<HoodCleaningLA />} />
        <Route path="/janitorial-services-los-angeles" element={<JanitorialServicesLA />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/best-practices" element={<BestPractices />} />
        <Route path="/environmental-impact" element={<EnvironmentalImpact />} />
        <Route path="/instant-estimate" element={<InstantEstimate />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
