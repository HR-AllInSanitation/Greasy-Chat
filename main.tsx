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
import HowGreaseTrapWorks from './pages/HowGreaseTrapWorks';
import WhichRestaurantsNeedGreaseTrapsLA from './pages/WhichRestaurantsNeedGreaseTrapsLA';
import HowToVerifyGreaseTrapService from './pages/HowToVerifyGreaseTrapService';
import GreaseTrapCleaningFrequency from './pages/GreaseTrapCleaningFrequency';
import FOGSewerImpactLA from './pages/FOGSewerImpactLA';
import LAHealthInspectionGuide from './pages/LAHealthInspectionGuide';
import LAFOGProgramExplained from './pages/LAFOGProgramExplained';
import WasteManifestExplained from './pages/WasteManifestExplained';
import FOGViolationsFinesLA from './pages/FOGViolationsFinesLA';
import NewRestaurantFOGComplianceLA from './pages/NewRestaurantFOGComplianceLA';
import { SiteLayout } from './components/SiteLayout';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
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
          <Route path="/how-a-grease-trap-works" element={<HowGreaseTrapWorks />} />
          <Route path="/which-restaurants-need-grease-traps-los-angeles" element={<WhichRestaurantsNeedGreaseTrapsLA />} />
          <Route path="/how-to-tell-if-grease-trap-was-serviced" element={<HowToVerifyGreaseTrapService />} />
          <Route path="/grease-trap-cleaning-frequency-guide" element={<GreaseTrapCleaningFrequency />} />
          <Route path="/fats-oils-grease-sewer-impact-los-angeles" element={<FOGSewerImpactLA />} />
          <Route path="/la-restaurant-health-inspection-guide" element={<LAHealthInspectionGuide />} />
          <Route path="/la-fog-program-explained" element={<LAFOGProgramExplained />} />
          <Route path="/grease-trap-waste-manifest-explained" element={<WasteManifestExplained />} />
          <Route path="/restaurant-fog-violations-fines-los-angeles" element={<FOGViolationsFinesLA />} />
          <Route path="/new-restaurant-grease-trap-compliance-la" element={<NewRestaurantFOGComplianceLA />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
