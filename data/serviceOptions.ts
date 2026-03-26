import { ServiceType } from '../types';

export type EstimatorServiceMode = 'quote' | 'contact';

export interface EstimatorServiceOption {
  key: string;
  label: string;
  description: string;
  icon: string;
  tag: string;
  mode: EstimatorServiceMode;
  defaultServiceType?: ServiceType;
}

export const estimatorServiceOptions: EstimatorServiceOption[] = [
  {
    key: 'grease-trap-interceptor',
    label: 'Grease Trap / Interceptor Pumping',
    description: 'Structured quote flow for grease trap, interceptor, and clarifier service.',
    icon: 'fa-faucet',
    tag: 'Quoteable',
    mode: 'quote',
    defaultServiceType: ServiceType.GREASE_TRAP,
  },
  {
    key: 'septic-holding-tank',
    label: 'Septic / Holding Tank Pumping',
    description: 'Lead capture and office follow-up for septic and holding tank requests.',
    icon: 'fa-water',
    tag: 'Office Review',
    mode: 'contact',
  },
  {
    key: 'hydro-jetting',
    label: 'Main Sewer Line Jetting / Hydro Jetting',
    description: 'Complex drain issues routed for manual review and scheduling.',
    icon: 'fa-water-ladder',
    tag: 'Complex Case',
    mode: 'contact',
  },
  {
    key: 'uco-recycling',
    label: 'UCO Recycling',
    description: 'Pickup and container interest routed to office follow-up.',
    icon: 'fa-recycle',
    tag: 'Eco-Friendly',
    mode: 'contact',
  },
  {
    key: 'restroom-rentals',
    label: 'Restroom Rentals',
    description: 'Rental requests captured for scheduling and inventory confirmation.',
    icon: 'fa-restroom',
    tag: 'Auxiliary',
    mode: 'contact',
  },
  {
    key: 'compliance-audit',
    label: 'Compliance Audit',
    description: 'Audit and documentation requests collected for specialist follow-up.',
    icon: 'fa-file-shield',
    tag: 'Legal',
    mode: 'contact',
  },
  {
    key: 'hood-cleaning',
    label: 'Hood Cleaning',
    description: 'Kitchen exhaust cleaning inquiries routed to office scheduling.',
    icon: 'fa-broom',
    tag: 'Kitchen',
    mode: 'contact',
  },
  {
    key: 'janitorial-services',
    label: 'Janitorial Services',
    description: 'Sanitation program leads sent for custom scope review.',
    icon: 'fa-soap',
    tag: 'Sanitation',
    mode: 'contact',
  },
];

export const estimatorServiceQueryMap: Record<string, string> = Object.fromEntries(
  estimatorServiceOptions.map(option => [option.key, option.label]),
);

export const getEstimatorServiceByKey = (key?: string | null): EstimatorServiceOption | null => {
  if (!key) return null;
  return estimatorServiceOptions.find(option => option.key === key) ?? null;
};

export const getEstimatorServiceByLabel = (label?: string | null): EstimatorServiceOption | null => {
  if (!label) return null;
  return estimatorServiceOptions.find(option => option.label === label) ?? null;
};
