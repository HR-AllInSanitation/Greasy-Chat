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