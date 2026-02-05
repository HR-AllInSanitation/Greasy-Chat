import { calculateServiceEstimate } from '../services/pricingEngine.ts';
import { BASE_LOCATION } from '../constants.ts';
import { Frequency, ServiceType } from '../types.ts';

const withDistance = (miles: number) => ({
  latitude: BASE_LOCATION.lat + miles / 69,
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

