import { test, expect } from '@playwright/test';
import { calculateServiceEstimate } from '../services/pricingEngine';
import { BASE_LOCATION } from '../constants';
import { Frequency, ServiceType, type EstimationInputs } from '../types';

const baseInputs = (overrides: Partial<EstimationInputs> = {}): EstimationInputs => ({
  serviceType: ServiceType.INTERCEPTOR,
  tierKey: 'matrix',
  frequency: Frequency.MONTHLY,
  isOpeningSoon: false,
  parkingDistance: 50,
  gallons: 1600,
  additionalServices: [],
  location: {
    latitude: BASE_LOCATION.lat,
    longitude: BASE_LOCATION.lng,
    address: BASE_LOCATION.address,
  },
  ...overrides,
});

test.describe('pricing engine guardrails', () => {
  test('maps hose fee tiers correctly', () => {
    const cases: Array<{ feet: number; fee: number }> = [
      { feet: 50, fee: 0 },
      { feet: 100, fee: 50 },
      { feet: 150, fee: 100 },
      { feet: 200, fee: 150 },
      { feet: 250, fee: 200 },
    ];

    for (const c of cases) {
      const result = calculateServiceEstimate(baseInputs({ parkingDistance: c.feet }));
      expect(result.manualQuote).toBeFalsy();
      expect(result.breakdown.hoseFee).toBe(c.fee);
    }
  });

  test('normalizes non-standard hose distance to a supported tier', () => {
    const result = calculateServiceEstimate(baseInputs({ parkingDistance: 75 }));
    expect(result.manualQuote).toBeFalsy();
    expect(result.breakdown.hoseFee).toBe(50);
    expect(result.notes.join(' ')).toContain('Parking distance normalized to 100 ft pricing tier.');
  });

  test('marks parking distance above 250 ft as office review', () => {
    const result = calculateServiceEstimate(baseInputs({ parkingDistance: 300 }));
    expect(result.manualQuote).toBeTruthy();
    expect(result.totalPrice).toBeNull();
    expect(result.notes.join(' ')).toContain('Parking distance exceeds 250 ft; office review required.');
  });

  test('uses >2500 manual-quote rule only for interceptor/clarifier', () => {
    const interceptor = calculateServiceEstimate(baseInputs({
      serviceType: ServiceType.INTERCEPTOR,
      gallons: 2501,
    }));
    expect(interceptor.manualQuote).toBeTruthy();

    const greaseTrap = calculateServiceEstimate(baseInputs({
      serviceType: ServiceType.GREASE_TRAP,
      gallons: 2501,
      parkingDistance: 50,
    }));
    expect(greaseTrap.manualQuote).toBeFalsy();
    expect(greaseTrap.baseServiceLabel).toContain('Grease Trap');
  });
});
