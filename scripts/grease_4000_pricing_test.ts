import { calculateServiceEstimate } from '../services/pricingEngine.ts';
import { BASE_LOCATION } from '../constants.ts';
import { Frequency, ServiceType } from '../types.ts';

const EARTH_RADIUS_MI = 3958.8;
const withDistance = (miles: number) => ({
  latitude: BASE_LOCATION.lat + (miles / EARTH_RADIUS_MI) * (180 / Math.PI),
  longitude: BASE_LOCATION.lng,
});

const runCase = (description: string, distance: number | null) => {
  const estimate = calculateServiceEstimate({
    serviceType: ServiceType.GREASE_TRAP,
    tierKey: 'matrix',
    frequency: Frequency.MONTHLY,
    isOpeningSoon: false,
    parkingDistance: 100,
    gallons: 2500,
    gallonsPlus: true,
    location: distance !== null ? withDistance(distance) : undefined,
  });

  const price = estimate.totalPrice;
  const priceDisplay = price === null ? 'null' : price;
  const manual = estimate.manualQuote ? 'manualQuote' : 'fixed';
  console.log(`${description}: distance=${distance ?? 'MISSING'} => ${priceDisplay} (${manual}) tier=${estimate.tierUsed ?? ''} verified=${estimate.distanceVerified ?? false}`);
};

const runCaseExpect = (description: string, distance: number, expectedPrice: number | null) => {
  const estimate = calculateServiceEstimate({
    serviceType: ServiceType.GREASE_TRAP,
    tierKey: 'matrix',
    frequency: Frequency.MONTHLY,
    isOpeningSoon: false,
    parkingDistance: 100,
    gallons: 2500,
    gallonsPlus: true,
    location: withDistance(distance),
  });

  const actual = estimate.totalPrice ?? null;
  const expected = expectedPrice === null ? null : expectedPrice;
  if (actual !== expected) {
    throw new Error(
      `${description} FAILED: distance=${distance} expected=${expected} actual=${actual} manualQuote=${estimate.manualQuote} tier=${estimate.tierUsed}`,
    );
  }
  console.log(`${description}: distance=${distance} => ${actual === null ? 'null' : actual} (expected)`);
};

console.log('=== GREASE 4,000 PRICING TEST ===\n');
console.log('Band selection (verified distance):');
runCase('0-10 band', 5);
runCase('11-20 band', 15);
runCase('71-80 band', 75);
runCase('101-120 band', 110);
runCase('141-160 band', 150);

console.log('\nOffice review cases (no numeric price):');
runCase('>160 mi', 161);
runCase('Unverified (no location)', null);

console.log('\nDecimal boundary cases (rounded up for banding):');
runCaseExpect('10.0 stays 0-10', 10, 2000);
runCaseExpect('10.1 -> 11-20', 10.1, 2200);
runCaseExpect('20.0 stays 11-20', 20, 2200);
runCaseExpect('20.1 -> 21-30', 20.1, 2400);
runCaseExpect('160.0 stays 141-160', 160, 5200);
runCaseExpect('160.1 -> outside bands', 160.1, null);

