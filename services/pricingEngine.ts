import { EstimationInputs, EstimationResult, ServiceType } from '../types';
import { BASE_LOCATION } from '../constants';

const GREASE_TRAP_BANDS: { max: number; price: number }[] = [
  { max: 10, price: 450 },
  { max: 20, price: 450 },
  { max: 30, price: 450 },
  { max: 40, price: 450 },
  { max: 50, price: 450 },
  { max: 60, price: 550 },
  { max: 70, price: 550 },
  { max: 80, price: 600 },
  { max: 90, price: 600 },
  { max: 100, price: 700 },
  { max: 120, price: 700 },
  { max: 140, price: 800 },
  { max: 160, price: 800 },
];

const INTERCEPTOR_BANDS: { max: number; tier1600: number; tier2500: number }[] = [
  { max: 10, tier1600: 800, tier2500: 1250 },
  { max: 20, tier1600: 880, tier2500: 1375 },
  { max: 30, tier1600: 960, tier2500: 1500 },
  { max: 40, tier1600: 1040, tier2500: 1625 },
  { max: 50, tier1600: 1120, tier2500: 1750 },
  { max: 60, tier1600: 1200, tier2500: 1875 },
  { max: 70, tier1600: 1280, tier2500: 2000 },
  { max: 80, tier1600: 1440, tier2500: 2250 },
  { max: 90, tier1600: 1520, tier2500: 2375 },
  { max: 100, tier1600: 1600, tier2500: 2500 },
  { max: 120, tier1600: 1920, tier2500: 3000 },
  { max: 140, tier1600: 2000, tier2500: 3125 },
  { max: 160, tier1600: 2080, tier2500: 3250 },
];

const ADD_ON_PRICES: Record<string, number> = {
  'grease break down': 300,
  'grease breakdown': 300,
  'hydrojetting': 600,
  'hydro jetting': 600,
  'lid removal': 250,
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    (Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getRadiusBand = (distance: number): { label: string; bandMax: number } | null => {
  if (Number.isNaN(distance) || distance < 0) return null;
  const sorted = [...GREASE_TRAP_BANDS].sort((a, b) => a.max - b.max);
  const found = sorted.find(b => distance <= b.max);
  if (!found) return null;
  const bandMin = found.max === 10 ? 0 : found.max - 9; // bands are 10-mile increments in the provided matrix
  return { label: `${bandMin <= 0 ? 0 : bandMin}-${found.max}`, bandMax: found.max };
};

const normalizeAddOnKey = (name: string): string | null => {
  if (!name) return null;
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!key) return null;
  if (key.includes('hydro')) return 'hydrojetting';
  if (key.includes('grease break')) return 'grease break down';
  if (key.includes('lid') && key.includes('removal')) return 'lid removal';
  return ADD_ON_PRICES[key] ? key : null;
};

export function calculateServiceEstimate(inputs: EstimationInputs): EstimationResult {
  const { serviceType, gallons, location, additionalServices } = inputs;

  let distanceMiles = 0;
  let distanceSource: 'computed' | 'assumed_25mi' = 'computed';
  const assumptions: string[] = [];
  const notes: string[] = [];
  const unverifiedDetails: string[] = [];
  let requiresVerification = false;

  if (location?.latitude && location?.longitude) {
    distanceMiles = getDistance(BASE_LOCATION.lat, BASE_LOCATION.lng, location.latitude, location.longitude);
  } else {
    distanceMiles = 25;
    distanceSource = 'assumed_25mi';
    assumptions.push('Distance assumed at 25mi from Sylmar HQ until address verification.');
    unverifiedDetails.push('Exact mileage from Sylmar HQ');
    requiresVerification = true;
  }

  const band = getRadiusBand(distanceMiles);
  if (!band) {
    return {
      minPrice: 0,
      maxPrice: 0,
      distance: Math.round(distanceMiles * 10) / 10,
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      radiusBand: 'outside-bands',
      distanceSource,
      distanceAssumed: distanceSource !== 'computed',
      assumptions,
      appliedDiscount: 0,
      discountType: 'Standard Rate',
      notes: [...notes, 'Distance outside configured bands; manual quote required.'],
      hydroJetRequired: false,
      requiresVerification: true,
      unverifiedDetails,
      inputsUsed: inputs,
      addOns: [],
      unknownAddOns: [],
      manualQuote: true,
      breakdown: {
        thresholdMi: 0,
        surchargePerMi: 0,
        milesFromHQ: Math.round(distanceMiles * 10) / 10,
        distanceFee: 0,
        hoseFee: 0,
        subtotalBeforeBuffer: 0,
      },
    };
  }

  let baseServicePrice = 0;
  let baseServiceLabel = '';
  let manualQuote = false;
  let tierUsed = '';
  let gallonsUncertain = false;

  if (serviceType === ServiceType.GREASE_TRAP) {
    baseServicePrice = GREASE_TRAP_BANDS.find(b => b.max === band.bandMax)?.price ?? 0;
    baseServiceLabel = 'Grease Trap Cleaning (Indoor)';
  } else if (serviceType === ServiceType.INTERCEPTOR || serviceType === ServiceType.CLARIFIER) {
    const rawGallons = typeof gallons === 'number' ? gallons : 0;
    const isClarifier = serviceType === ServiceType.CLARIFIER;
    const uncertain = !gallons || gallons <= 0;
    gallonsUncertain = uncertain;
    if (uncertain) {
      tierUsed = '<=1600';
      notes.push('Gallons provided as UNSURE; priced at <=1600 tier.');
    }
    if (rawGallons > 2500) {
      manualQuote = true;
      notes.push('Capacity exceeds 2500 gallons; manual quote required.');
    } else {
      if (!tierUsed) tierUsed = rawGallons > 1600 ? '<=2500' : '<=1600';
      const row = INTERCEPTOR_BANDS.find(b => b.max === band.bandMax);
      if (row) {
        baseServicePrice = tierUsed === '<=2500' ? row.tier2500 : row.tier1600;
        const label = tierUsed === '<=2500' ? 'up to 2,500 gal' : 'up to 1,600 gal';
        baseServiceLabel = `${isClarifier ? 'Clarifier' : 'Interceptor'} Pumping (${label})`;
      }
    }
    if (isClarifier) {
      notes.push('Clarifier priced using interceptor table; verify.');
    }
  }

  if (!baseServiceLabel || baseServicePrice <= 0) {
    manualQuote = true;
    notes.push('Service type or pricing row missing; manual quote required.');
  }

  const addOns: { name: string; price: number }[] = [];
  const unknownAddOns: string[] = [];
  (additionalServices || []).forEach(raw => {
    const key = normalizeAddOnKey(raw);
    if (key && ADD_ON_PRICES[key] !== undefined) {
      addOns.push({ name: key, price: ADD_ON_PRICES[key] });
    } else if (raw && raw.trim()) {
      unknownAddOns.push(raw.trim());
    }
  });

  const addOnTotal = addOns.reduce((sum, item) => sum + item.price, 0);

  const totalPrice = manualQuote ? 0 : baseServicePrice + addOnTotal;

  if (distanceSource === 'assumed_25mi') requiresVerification = true;
  if (gallonsUncertain) requiresVerification = true;
  if (unknownAddOns.length) notes.push(`Unrecognized add-ons: ${unknownAddOns.join(', ')}`);

  return {
    minPrice: Math.round(totalPrice),
    maxPrice: Math.round(totalPrice),
    distance: Math.round(distanceMiles * 10) / 10,
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    radiusBand: band.label,
    distanceSource,
    distanceAssumed: distanceSource !== 'computed',
    assumptions,
    tierUsed,
    gallonsUncertain,
    addOns,
    unknownAddOns,
    manualQuote,
    baseServiceLabel,
    baseServicePrice,
    totalPrice,
    appliedDiscount: 0,
    discountType: 'Standard Rate',
    notes,
    hydroJetRequired: false,
    requiresVerification,
    unverifiedDetails,
    inputsUsed: inputs,
    breakdown: {
      thresholdMi: 0,
      surchargePerMi: 0,
      milesFromHQ: Math.round(distanceMiles * 10) / 10,
      distanceFee: 0,
      hoseFee: 0,
      subtotalBeforeBuffer: Math.round(totalPrice),
    },
  };
}