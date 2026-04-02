import { EstimationInputs, EstimationResult, ServiceType } from '../types';
import { BASE_LOCATION, HOSE_FEE_SCHEDULE } from '../constants';

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

const GREASE_4000_DISTANCE_PRICING = [
  { min: 0, max: 10, price: 2000, band: '0-10' },
  { min: 11, max: 20, price: 2200, band: '11-20' },
  { min: 21, max: 30, price: 2400, band: '21-30' },
  { min: 31, max: 40, price: 2600, band: '31-40' },
  { min: 41, max: 50, price: 2800, band: '41-50' },
  { min: 51, max: 60, price: 3000, band: '51-60' },
  { min: 61, max: 70, price: 3200, band: '61-70' },
  { min: 71, max: 80, price: 3600, band: '71-80' },
  { min: 81, max: 90, price: 3800, band: '81-90' },
  { min: 91, max: 100, price: 4000, band: '91-100' },
  { min: 101, max: 120, price: 4800, band: '101-120' },
  { min: 121, max: 140, price: 5000, band: '121-140' },
  { min: 141, max: 160, price: 5200, band: '141-160' },
] as const;

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
  'hydrojetting': 600,
  'hydro jetting': 600,
  'grease break down': 300,
  'grease breakdown': 300,
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

const priceForGrease4000ByMiles = (distanceMiles: number | null | undefined) => {
  if (distanceMiles == null || !Number.isFinite(distanceMiles)) return null;
  const EPSILON = 1e-6;
  const d = Math.max(0, Math.ceil(distanceMiles - EPSILON));
  const band = GREASE_4000_DISTANCE_PRICING.find(b => d >= b.min && d <= b.max);
  return band ? { ...band, distanceMiles: d } : null;
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
  const { serviceType, gallons, gallonsPlus, location, additionalServices, capacityTier, capacityUnsure, manualQuoteFlag, parkingDistance } = inputs;

  let distanceMiles = 0;
  let distanceSource: 'computed' | 'assumed_25mi' = 'computed';
  const assumptions: string[] = [];
  const notes: string[] = [];
  const unverifiedDetails: string[] = [];
  let requiresVerification = false;
  let distanceVerified = false;

  if (location?.latitude && location?.longitude) {
    distanceMiles = getDistance(BASE_LOCATION.lat, BASE_LOCATION.lng, location.latitude, location.longitude);
    distanceVerified = true;
  } else {
    distanceMiles = 25;
    distanceSource = 'assumed_25mi';
    assumptions.push('Distance assumed at 25mi from Sylmar HQ until address verification.');
    unverifiedDetails.push('Exact mileage from Sylmar HQ');
    requiresVerification = true;
    distanceVerified = false;
  }

  const band = getRadiusBand(distanceMiles);
  if (!band) {
    notes.push('Distance outside configured bands; manual quote required.');
    requiresVerification = true;
  }

  let baseServicePrice = 0;
  let baseServiceLabel = '';
  let manualQuote = manualQuoteFlag === true;
  let tierUsed = '';
  let gallonsUncertain = false;
  let capacityTierUsed: 'UP_TO_1600' | 'UP_TO_2500' | '' = '';
  const capacityUnsureFlag = capacityUnsure === true;

  if (serviceType === ServiceType.GREASE_TRAP) {
    // Per business rules, >2,500 gal logic applies only to Interceptor/Clarifier.
    // Grease Trap always follows the Grease Trap distance-band pricing table.
    baseServicePrice = band ? GREASE_TRAP_BANDS.find(b => b.max === band.bandMax)?.price ?? 0 : 0;
    baseServiceLabel = 'Grease Trap Cleaning (Indoor)';
  } else if (serviceType === ServiceType.INTERCEPTOR || serviceType === ServiceType.CLARIFIER) {
    const rawGallons = typeof gallons === 'number' ? gallons : 0;
    const isClarifier = serviceType === ServiceType.CLARIFIER;
    const uncertain = !gallons || gallons <= 0 || capacityUnsureFlag;
    gallonsUncertain = uncertain;

    if (rawGallons > 2500) {
      manualQuote = true;
      capacityTierUsed = 'UP_TO_2500';
      tierUsed = '<=2500';
      notes.push('Capacity exceeds 2,500 gallons; manual quote required.');
    } else {
      if (uncertain) {
        tierUsed = '<=1600';
        capacityTierUsed = 'UP_TO_1600';
        notes.push('Capacity unsure — defaulted to up to 1,600 for estimate.');
      } else if (capacityTier === 'UP_TO_2500' || rawGallons > 1600) {
        tierUsed = '<=2500';
        capacityTierUsed = 'UP_TO_2500';
      } else {
        tierUsed = '<=1600';
        capacityTierUsed = 'UP_TO_1600';
      }

      const row = band ? INTERCEPTOR_BANDS.find(b => b.max === band.bandMax) : null;
      if (row) {
        baseServicePrice = capacityTierUsed === 'UP_TO_2500' ? row.tier2500 : row.tier1600;
        const label = capacityTierUsed === 'UP_TO_2500' ? 'up to 2,500 gal' : 'up to 1,600 gal';
        baseServiceLabel = `${isClarifier ? 'Clarifier' : 'Interceptor'} Pumping (${label})`;
      }
    }
    if (!capacityTierUsed) {
      capacityTierUsed = (capacityTier === 'UP_TO_2500' || rawGallons > 1600) ? 'UP_TO_2500' : 'UP_TO_1600';
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

  // Hose / parking-distance surcharge
  const hoseFt = typeof parkingDistance === 'number' ? parkingDistance : 0;
  const hoseFee = HOSE_FEE_SCHEDULE[hoseFt] ?? 0;

  // BLOCKER #2 FIX: Return null (not 0) for office review cases
  const totalPrice = manualQuote ? null : baseServicePrice + addOnTotal + hoseFee;

  if (distanceSource === 'assumed_25mi') requiresVerification = true;
  if (gallonsUncertain) requiresVerification = true;
  if (unknownAddOns.length) notes.push(`Unrecognized add-ons: ${unknownAddOns.join(', ')}`);

  return {
    minPrice: totalPrice !== null ? Math.round(totalPrice) : null,
    maxPrice: totalPrice !== null ? Math.round(totalPrice) : null,
    distance: Math.round(distanceMiles * 10) / 10,
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    radiusBand: band?.label ?? 'outside-bands',
    radius_band: band?.label ?? 'outside-bands',
    distanceSource,
    distanceAssumed: distanceSource !== 'computed',
    distanceVerified,
    assumptions,
    tierUsed,
    gallonsUncertain,
    addOns,
    add_ons: addOns,
    unknownAddOns,
    manualQuote,
    manual_quote: manualQuote,
    capacity_tier: capacityTierUsed,
    capacity_unsure: capacityUnsureFlag,
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
      hoseFee,
      subtotalBeforeBuffer: Math.round(totalPrice ?? 0),
    },
  };
}