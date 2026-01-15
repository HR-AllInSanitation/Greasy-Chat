import { EstimationInputs, EstimationResult, ServiceType } from '../types';
import { PRICING_RULES, FREQUENCY_ADJUSTMENTS, NEW_RESTAURANT_DISCOUNT, BASE_LOCATION } from '../constants';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            (Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateServiceEstimate(inputs: EstimationInputs): EstimationResult {
  const { serviceType, frequency, isOpeningSoon, parkingDistance, gallons, location } = inputs;
  
  let distance = 0;
  let distanceSource: 'computed' | 'assumed_25mi' = 'computed';
  let requiresVerification = false;
  const unverifiedDetails: string[] = [];
  const notes: string[] = [];
  const assumptions: string[] = [];

  // 1. Distance Calculation from Sylmar HQ
  if (location?.latitude && location?.longitude) {
    distance = getDistance(BASE_LOCATION.lat, BASE_LOCATION.lng, location.latitude, location.longitude);
  } else {
    requiresVerification = true;
    unverifiedDetails.push('Exact mileage from Sylmar HQ');
    distance = 25; // Default for radius estimation
    distanceSource = 'assumed_25mi';
    assumptions.push('Distance assumed at 25mi from Sylmar HQ until address verification.');
  }

  let baseMin = 0;
  let thresholdMi = 0;
  let surchargePerMi = 0;
  const VARIANCE_BUFFER = 1.25;

  // 2. Base Calculation by Family
  if (serviceType === ServiceType.GREASE_TRAP) {
    const rules = PRICING_RULES.GREASE_TRAP;
    baseMin = rules.baseRate;
    thresholdMi = rules.distThreshold;
    surchargePerMi = rules.distSurcharge;
    
    if (gallons && gallons > rules.maxGallons) {
      baseMin += (gallons - rules.maxGallons) * 1.5;
      notes.push(`High-capacity indoor trap: ${gallons}gal.`);
    }
  } 
  else if (serviceType === ServiceType.HYDRO_JET) {
    const rules = PRICING_RULES.HYDRO_JET;
    baseMin = rules.baseRate;
    thresholdMi = rules.distThreshold;
    surchargePerMi = rules.distSurcharge;
    notes.push("Estimate based on standard line jetting (up to 2 hours).");
  }
  else if (serviceType === ServiceType.INTERCEPTOR || serviceType === ServiceType.CLARIFIER) {
    const isClarifier = serviceType === ServiceType.CLARIFIER;
    const rules = isClarifier ? PRICING_RULES.CLARIFIER : PRICING_RULES.INTERCEPTOR;
    
    thresholdMi = rules.distThreshold;
    surchargePerMi = rules.distSurcharge;
    
    // UNSURE LOGIC: Default to 1600gal safety default if unknown
    let effectiveGallons = (gallons && gallons > 0) ? gallons : 1600;
    if (!gallons || gallons === 0) {
      requiresVerification = true;
      unverifiedDetails.push('Tank Capacity (Audit Required)');
      notes.push("Quote based on 1600gal safety default. Site verification required for final capacity audit.");
    }

    const volPrice = effectiveGallons * rules.ratePerGallon;
    baseMin = Math.max(rules.minCharge, volPrice);
    
    if (isClarifier) notes.push("Clarifier specialized waste components included.");
  }

  const fallbackFloors: Partial<Record<ServiceType, number>> = {
    [ServiceType.GREASE_TRAP]: PRICING_RULES.GREASE_TRAP.baseRate,
    [ServiceType.INTERCEPTOR]: PRICING_RULES.INTERCEPTOR.minCharge,
    [ServiceType.CLARIFIER]: PRICING_RULES.CLARIFIER.minCharge,
  };
  const floor = fallbackFloors[serviceType];
  if (floor && baseMin < floor) {
    baseMin = floor;
  }

  // 3. Distance Fee Calculation
  const distanceFee = Math.max(0, distance - thresholdMi) * surchargePerMi;
  baseMin += distanceFee;

  // 4. Hose Distance Surcharge (50ft included; each additional 50ft segment = $100)
  const HOSE_INCLUDED_FT = 50;
  const HOSE_SEGMENT_FT = 50;
  const HOSE_SEGMENT_PRICE = 100;

  const segmentsNeeded = parkingDistance > 0 ? Math.ceil(parkingDistance / HOSE_SEGMENT_FT) : 0;
  const extraSegments = Math.max(0, segmentsNeeded - 1);
  const hoseFee = extraSegments * HOSE_SEGMENT_PRICE;

  if (hoseFee > 0) {
    baseMin += hoseFee;
    notes.push(`Extended hose run: ${parkingDistance}ft (+${extraSegments} hose${extraSegments > 1 ? 's' : ''}).`);
    requiresVerification = true;
  }

  // 5. Frequency Adjustment
  const freqMult = FREQUENCY_ADJUSTMENTS[frequency] || 1.0;
  baseMin *= freqMult;

  // 6. Discount Logic
  let appliedDiscount = 0;
  let discountType = 'Standard Rate';
  if (isOpeningSoon) {
    baseMin *= (1 - NEW_RESTAURANT_DISCOUNT);
    appliedDiscount = Math.round(NEW_RESTAURANT_DISCOUNT * 100);
    discountType = 'Grand Opening Special';
  }

  const subtotalBeforeBuffer = baseMin;

  return {
    minPrice: Math.round(baseMin),
    maxPrice: Math.round(baseMin * VARIANCE_BUFFER), // Applies to GRAN TOTAL FINAL
    distance: Math.round(distance * 10) / 10,
    distanceSource,
    assumptions,
    appliedDiscount,
    discountType,
    notes,
    hydroJetRequired: false,
    requiresVerification,
    unverifiedDetails,
    inputsUsed: inputs,
    breakdown: {
      thresholdMi,
      surchargePerMi,
      milesFromHQ: Math.round(distance * 10) / 10,
      distanceFee: Math.round(distanceFee),
      hoseFee: Math.round(hoseFee),
      subtotalBeforeBuffer: Math.round(subtotalBeforeBuffer)
    }
  };
}