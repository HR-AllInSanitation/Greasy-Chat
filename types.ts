export enum ServiceType {
  GREASE_TRAP = 'GreaseTrap',
  INTERCEPTOR = 'Interceptor',
  CLARIFIER = 'Clarifier',
  HYDRO_JET = 'HydroJet',
  UCO = 'UCO', // Used Cooking Oil
  FAT_BONES = 'FatBones'
}

export enum Frequency {
  ONCE = 'Once',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  BI_ANNUAL = 'Bi-Annual'
}

export interface PricingTier {
  service: ServiceType;
  key: string; 
  minBase: number;
  maxBase: number;
  notes: string;
}

export interface EstimationInputs {
  serviceType: ServiceType;
  tierKey: string;
  frequency: Frequency;
  isOpeningSoon: boolean;
  parkingDistance: number;
  gallons?: number; 
  monthsSinceLastService?: number;
  additionalServices?: string[];
  capacityTier?: 'UP_TO_1600' | 'UP_TO_2500';
  capacityUnsure?: boolean;
  manualQuoteFlag?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface EstimationResult {
  minPrice: number;
  maxPrice: number;
  distance: number; // Miles from Sylmar base
  distanceSource?: string;
  assumptions?: string[];
  distanceMiles?: number;
  radiusBand?: string;
  radius_band?: string;
  distanceAssumed?: boolean;
  tierUsed?: string;
  gallonsUncertain?: boolean;
  addOns?: { name: string; price: number }[];
  unknownAddOns?: string[];
  manualQuote?: boolean;
  baseServiceLabel?: string;
  baseServicePrice?: number;
  totalPrice?: number;
  capacity_tier?: string;
  capacity_unsure?: boolean;
  manual_quote?: boolean;
  add_ons?: { name: string; price: number }[];
  appliedDiscount: number;
  discountType: string;
  notes: string[];
  hydroJetRequired: boolean;
  requiresVerification?: boolean; 
  unverifiedDetails?: string[];
  inputsUsed?: Partial<EstimationInputs>;
  breakdown: {
    thresholdMi: number;
    surchargePerMi: number;
    milesFromHQ: number;
    distanceFee: number;
    hoseFee: number;
    subtotalBeforeBuffer: number;
  };
}

export interface LeadInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  restaurantName: string; 
  parkingDistance: number;
  gallons?: number;
  needsRestroom: boolean;
  needsUCORecycling: boolean;
  additionalComments: string;
  lastServiceDate: string;
  preferredSchedule?: string;
  requiresVerification?: boolean;
}