import { calculateServiceEstimate } from '../services/pricingEngine';
import { EstimationInputs, EstimationResult, Frequency, ServiceType } from '../types';
import type { EstimatorServiceOption } from '../data/serviceOptions';

export interface EstimateFormValues {
  businessName: string;
  addressLine: string;
  city: string;
  state: string;
  zip: string;
  systemType: ServiceType;
  frequency: Frequency;
  gallons: string;
  parkingDistance: string;
  additionalServices: string[];
  notes: string;
}

export interface EstimateContactValues {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  preferredContact: 'phone' | 'email' | 'either';
}

export const defaultEstimateFormValues: EstimateFormValues = {
  businessName: '',
  addressLine: '',
  city: '',
  state: 'CA',
  zip: '',
  systemType: ServiceType.GREASE_TRAP,
  frequency: Frequency.MONTHLY,
  gallons: '',
  parkingDistance: '',
  additionalServices: [],
  notes: '',
};

export const defaultEstimateContactValues: EstimateContactValues = {
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  preferredContact: 'either',
};

export const parseGallonsInput = (raw: string): { num: number; plus: boolean } => {
  const trimmed = raw.trim();
  const plus = trimmed.includes('+');
  const cleaned = trimmed.replace(/[^\d]/g, '');
  const num = cleaned ? Number(cleaned) : 0;
  return {
    num: Number.isFinite(num) ? num : 0,
    plus,
  };
};

export const hasMinPhoneDigits = (value: string, minDigits = 10): boolean => value.replace(/\D/g, '').length >= minDigits;

export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const createManualReviewEstimate = (): EstimationResult => ({
  minPrice: null,
  maxPrice: null,
  distance: 0,
  appliedDiscount: 0,
  discountType: 'Manual Review',
  notes: ['Office review required.'],
  hydroJetRequired: false,
  manualQuote: true,
  manual_quote: true,
  totalPrice: null,
  breakdown: {
    thresholdMi: 0,
    surchargePerMi: 0,
    milesFromHQ: 0,
    distanceFee: 0,
    hoseFee: 0,
    subtotalBeforeBuffer: 0,
  },
});

export const geocodeAddress = async (values: EstimateFormValues) => {
  if (!values.addressLine || !values.city || !values.state || !values.zip) return undefined;
  const response = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      addressLine1: values.addressLine,
      city: values.city,
      state: values.state,
      zip: values.zip,
    }),
  });

  if (!response.ok) return undefined;
  const data = await response.json();
  if (!data?.verified) return undefined;
  return {
    latitude: data.lat,
    longitude: data.lng,
    address: data.normalizedAddress,
  };
};

export const createEstimateFromForm = async (values: EstimateFormValues): Promise<EstimationResult> => {
  const gallonsParsed = parseGallonsInput(values.gallons);
  const location = await geocodeAddress(values);

  const inputs: EstimationInputs = {
    serviceType: values.systemType,
    tierKey: 'matrix',
    frequency: values.frequency,
    isOpeningSoon: false,
    parkingDistance: Number(values.parkingDistance) || 0,
    gallons: gallonsParsed.num,
    gallonsPlus: gallonsParsed.plus,
    location,
    additionalServices: values.additionalServices,
  };

  return calculateServiceEstimate(inputs);
};

export const buildLeadPayload = (params: {
  service: EstimatorServiceOption;
  form: EstimateFormValues;
  contact: EstimateContactValues;
  estimate: EstimationResult;
  source?: string;
}) => ({
  intake: {
    business_name: params.form.businessName,
    address_line: params.form.addressLine,
    city: params.form.city,
    state: params.form.state,
    zip: params.form.zip,
    system_type: params.form.systemType,
    frequency: params.form.frequency,
    gallons: params.form.gallons,
    parking_distance: params.form.parkingDistance,
    additional_services: params.form.additionalServices.join(', '),
    last_service_months: '',
    last_cleaned_at: '',
    needs_uco: '',
    wants_to_move_forward: 'UNSURE',
    notes: params.form.notes,
  },
  contact: {
    contact_name: params.contact.contactName,
    contact_phone: params.contact.contactPhone,
    contact_email: params.contact.contactEmail,
    preferred_contact: params.contact.preferredContact,
  },
  estimate: params.estimate,
  meta: {
    source: params.source || 'intelligent-form',
    service: params.service.label,
    serviceKey: params.service.key,
    leadEvent: 'estimate_created',
  },
  createdAt: new Date().toISOString(),
});

export const submitLeadPayload = async (payload: ReturnType<typeof buildLeadPayload>) => {
  const response = await fetch('/api/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response.ok;
};
