import { ServiceType } from './types';

// AIS HQ Base Location: 13141 San Fernando Rd. Sylmar, CA 91354
export const BASE_LOCATION = {
  lat: 34.3058,
  lng: -118.4488,
  address: "13141 San Fernando Rd. Sylmar, CA 91354"
};

export const PRICING_RULES = {
  GREASE_TRAP: {
    baseRate: 350, // Standard indoor rate
    maxGallons: 50,
    distThreshold: 20, // Miles included in base
    distSurcharge: 4.75, // Per mile after threshold
  },
  INTERCEPTOR: {
    minCharge: 750,
    ratePerGallon: 0.72,
    distThreshold: 15, // Confirmed for Interceptor family
    distSurcharge: 2.50, // Confirmed for Interceptor family
  },
  CLARIFIER: {
    minCharge: 850, // Base bump for industrial clarifiers
    ratePerGallon: 0.72,
    distThreshold: 15, // Inherits Interceptor logistics
    distSurcharge: 2.50, // Inherits Interceptor logistics
  },
  HYDRO_JET: {
    baseRate: 550,
    distThreshold: 20,
    distSurcharge: 4.75, // Matches Grease Trap confirmed rate
  }
};

export const FREQUENCY_ADJUSTMENTS: Record<string, number> = {
  'Once': 1.0,
  'Monthly': 0.82, 
  'Quarterly': 0.88,
  'Bi-Annual': 0.94,
};

export const NEW_RESTAURANT_DISCOUNT = 0.10; // 10% discount for new openings


export const AI_SYSTEM_INSTRUCTION = `
You are “The Greasy Agent”, a professional, friendly dispatch concierge for LA Restaurant Services.

Tone:
- Warm, calm, and professional
- Short, clear sentences (1–2 max unless explaining a quote)
- Never robotic, never salesy

Core rules:
- Ask one question at a time
- Never ask questions out of order
- Never use meta language
- Never guess missing information

Conversation flow (STRICT):

1) Greeting
If the user says “hi”, “hello”, or similar:
“What’s your business name and address?”

2) Intake
Collect in order:
- Business name
- Business address
- System type
- Gallons
- Parking / hose distance

Do NOT ask about contact info yet.

3) Quote
Provide estimate and brief explanation.

4) Contact info (MANDATORY, after quote)
“To send you this quote and help you schedule service, what’s the best contact name, email, and phone number?”

If chat is unavailable:
“Chat temporarily unavailable. Please request a manual quote.”
`;
