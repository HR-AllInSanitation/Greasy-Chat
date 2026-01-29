/// <reference types="vite/client" />

declare const __OFFICE_PHONE__: string;
declare const __IS_E2E__: boolean;

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { calculateServiceEstimate } from '../services/pricingEngine';
import { EstimationInputs, EstimationResult, Frequency, ServiceType } from '../types';

const OFFICE_PHONE = typeof __OFFICE_PHONE__ === 'string' ? __OFFICE_PHONE__ : '';
if (import.meta.env.DEV && !OFFICE_PHONE.trim()) {
  console.warn('VITE_OFFICE_PHONE is empty; the tel CTA will not render in contact-only flows.');
}

const getOfficePhoneValue = (): string => OFFICE_PHONE;

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(hostname);
let HAS_WARNED_E2E_PROD = false;
const IS_E2E = import.meta.env.DEV && __IS_E2E__ && IS_LOCAL;
if (import.meta.env.PROD && __IS_E2E__ && !HAS_WARNED_E2E_PROD) {
  HAS_WARNED_E2E_PROD = true;
  console.warn('VITE_E2E is set in production; test hooks remain disabled.');
}

const isContactOnlyService = (label?: string | null) => label === 'Septic / Holding Tank Pumping' || label === 'Main Sewer Line Jetting / Hydro Jetting';

const normalizePhoneForTel = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasLeadingPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7) return null;
  const normalized = `${hasLeadingPlus ? '+' : ''}${digits}`;
  if (!/^\+?\d{7,15}$/.test(normalized)) return null;
  return normalized;
};

const generateQuoteId = () =>
  `QT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

type IntakeState = {
  business_name: string;
  address_line: string;
  city: string;
  state: string;
  zip: string;
  system_type: string;
  gallons: string;
  parking_distance: string;
  last_service_months: string;
  additional_services: string;
  wants_to_move_forward: boolean | 'UNSURE';
};

type ContactState = {
  contact_name: string;
  contact_phone: string;
  contact_email: string;
};

type IntakeField = keyof IntakeState;
type ContactField = keyof ContactState;

interface Message {
  role: 'user' | 'model';
  text: string;
  estimate?: EstimationResult;
  quoteId?: string;
  link?: MessageLink;
}

type MessageLink = {
  href: string;
  label: string;
};

type MoveForward = true | false | 'UNSURE' | null;

const normalizeMoveForward = (raw: unknown): MoveForward => {
  if (raw === true) return true;
  if (raw === false) return false;
  if (typeof raw === 'string') {
    const t = raw.trim().toLowerCase();
    if (t === 'true') return true;
    if (t === 'false') return false;
    if (t === 'unsure') return 'UNSURE';
  }
  return null;
};

const getHandoffLink = (serviceLabel?: string | null): MessageLink | null => {
  const officePhone = getOfficePhoneValue().trim();
  if (!officePhone || !isContactOnlyService(serviceLabel)) return null;
  const normalizedPhone = normalizePhoneForTel(officePhone);
  if (!normalizedPhone) return null;
  const telHref = `tel:${normalizedPhone}`;
  return { href: telHref, label: `Call/Text: ${normalizedPhone}` };
};

const getHandoffMessage = (opts: { serviceLabel?: string | null; moveForward?: MoveForward; needsOfficeReview?: boolean }): string => {
  const label = opts.serviceLabel ? ` for "${opts.serviceLabel}"` : '';
  const urgencyLink = getHandoffLink(opts.serviceLabel);
  const urgencyLine = urgencyLink ? ` If this is urgent, ${urgencyLink.label}.` : '';
  if (opts.moveForward === true) {
    return `Perfect — we sent this to our office${label}. You’ll hear back by the next business day.${urgencyLine}`;
  }
  if (opts.needsOfficeReview) {
    return `Thanks — request received${label}. We sent this to our office for a quick review. You’ll hear back by the next business day.${urgencyLine}`;
  }
  return `Thanks — request received${label}. We sent this to our office. You’ll hear back by the next business day.${urgencyLine}`;
};

const isNonEmptyValue = (v: unknown) => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
};

const isUnsureValue = (s: string): boolean => {
  const t = s.trim().toLowerCase();
  if (!t) return false;
  return [
    'unsure',
    'not sure',
    "im not sure",
    "i'm not sure",
    'dont know',
    "don't know",
    'i dont know',
    "i don't know",
    'not certain',
    "im not certain",
    "i'm not certain",
    'no se',
    'no sé',
    'nose',
    'ni idea',
    'no estoy seguro',
    'no estoy segura',
    'incierto',
  ].includes(t);
};

const stripFillers = (input: string): string => {
  const trimmed = input.trim();
  // Do not strip short tokens or 2-letter state codes (e.g., CA) to avoid wiping valid answers.
  if (trimmed.length <= 3 || /^[a-zA-Z]{2}$/.test(trimmed)) return trimmed;
  return trimmed.replace(/^\b(?:sure|okay|ok|yeah|hey|hello|hi|well|um|uh|yo|sup)[,\s]*/i, '').trim();
};

const normalizeStateInput = (text: string): string | null => {
  const t = text.trim().toUpperCase();
  if (!t) return null;
  if (t === 'CA' || t === 'CALIFORNIA') return 'CA';
  if (/^[A-Z]{2}$/.test(t)) return t;
  return null;
};

const extractBusinessName = (input: string): string | null => {
  const cleaned = stripFillers(input);
  const match = cleaned.match(/^(?:it['’]?s|its)\s+(.+)/i);
  if (match && match[1]?.trim()) return match[1].trim();
  return cleaned.length > 0 ? cleaned : null;
};

const extractContactName = (input: string): string | null => {
  const cleaned = stripFillers(input);
  return cleaned.length >= 2 ? cleaned : null;
};

const isValidFallback = (field: string, text: string): boolean => {
  const clean = text.trim();
  if (!clean) return false;
  switch (field) {
    case 'address_line':
      return /\d/.test(clean) && clean.split(/\s+/).length >= 3;
    case 'state': {
      const lower = clean.toLowerCase();
      return /^[a-zA-Z]{2}$/.test(clean) || lower === 'california';
    }
    case 'zip':
      return /^\d{5}$/.test(clean);
    case 'gallons': {
      if (isUnsureValue(clean)) return true;
      if (!/^\d+$/.test(clean)) return false;
      const n = Number(clean);
      return n > 0 && n <= 20000;
    }
    case 'parking_distance': {
      if (isUnsureValue(clean)) return true;
      return /^\d+$/.test(clean);
    }
    case 'last_service_months':
      return /^\d+$/.test(clean);
    case 'additional_services':
      return clean.length > 0 && !isInterjection(clean);
    case 'contact_phone': {
      const digits = clean.replace(/\D/g, '');
      return digits.length >= 10;
    }
    case 'contact_email':
      return /@/.test(clean) && /\./.test(clean);
    case 'contact_name':
      if (isInterjection(clean)) return false;
      return clean.length >= 2 && /[a-zA-Z]/.test(clean);
    case 'city':
      if (isInterjection(clean)) return false;
      return /^[a-zA-Z\s]{2,}$/.test(clean);
    case 'business_name': {
      const hasLetters = /[a-zA-Z]/.test(clean);
      const isGreeting = /^(hello|hi|hey|hola)\b/i.test(clean);
      if (isInterjection(clean)) return false;
      return hasLetters && !isGreeting;
    }
    default:
      return true;
  }
};

const isInterjection = (text: string): boolean => {
  const t = text.trim().toLowerCase();
  if (!t) return false;

  // Punctuation-only / non-answer noise
  if (/^[!?.,\s]+$/.test(t)) return true;

  const normalized = t
    .replace(/\s+/g, ' ')
    .replace(/[!?.,]+$/g, '')
    .trim();

  return /^(hi|hello|hey|hola|yo|sup|ok|okay|k|what|wut|huh|thanks|thank you|gracias|buenas|buenos dias|buenas tardes|good morning|good afternoon|good evening)$/.test(
    normalized,
  );
};

const parseMoveForwardIntent = (text: string): boolean | 'UNSURE' | null => {
  const t = text.trim().toLowerCase().replace(/[!,\.]/g, '');
  if (!t) return null;
  const yes = ['yes', 'y', 'yeah', 'yup', 'sure', 'ok', 'okay', 'affirmative', 'let us do it', "let's do it", 'move forward', 'proceed', 'book', 'schedule', 'yes move forward'];
  const no = ['no', 'n', 'nope', 'not now', 'not right now', 'later', 'maybe later', 'hold off', 'pass', 'not right now', 'not rightnow', 'not right-now'];
  if (yes.some(val => t === val || t.includes(val))) return true;
  if (no.some(val => t === val || t.includes(val))) return false;
  return null;
};

const getAck = () => {
  const acks = ['Got it 👍', 'Thanks!', 'Perfect.', 'Confirmed!', 'Received!'];
  return acks[Math.floor(Math.random() * acks.length)];
};

const parseAdditionalServices = (raw: string): string[] =>
  raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

export const ChatInterface: React.FC = () => {
  // Track selected core service label
  const selectedServiceLabelRef = useRef<string | null>(null);
  const [isGlowing, setIsGlowing] = useState(false);

  // Listen for greasy-select-service event
  useEffect(() => {
    const handler = (e: any) => {
      const label = e?.detail?.label;
      if (!label) return;
      const previous = selectedServiceLabelRef.current;
      const normalizedLabel = String(label);
      const changed = !!previous && previous !== normalizedLabel;
      const isEstimatorLabel = normalizedLabel === 'Grease Trap / Interceptor Pumping';
      const isContactOnlyLabel = isContactOnlyService(normalizedLabel);

      // Dedupe: if same selection, just focus and bail
      if (previous === normalizedLabel) {
        inputRef.current?.focus?.();
        return;
      }

      selectedServiceLabelRef.current = normalizedLabel;

      if (changed) {
        pushModel(`Updated — noted request for "${normalizedLabel}".`);
      }

      if (isEstimatorLabel) {
        phaseRef.current = 'intake';
        const updatedIntake = { ...intakeRef.current, system_type: ServiceType.GREASE_TRAP } as IntakeState;
        intakeRef.current = updatedIntake;
        setIntake(updatedIntake);
        const next = getFirstMissingField(updatedIntake);
        if (next) pushModel(getQuestionForField(next));
        inputRef.current?.focus?.();
        return;
      }

      // Contact-only or other core services
      phaseRef.current = 'contact';
      if (!changed) {
        pushModel(`Got it — you're interested in "${normalizedLabel}". Please reply with your name, phone number, and email (you can send all three in one message).`);
      }

      if (isContactOnlyLabel) {
        const manual = makeManualQuoteEstimate();
        setCurrentEstimate(manual);
        currentEstimateRef.current = manual;
      }

      const nextContact = getFirstMissingContactField(contactRef.current);
      if (nextContact) pushModel(getQuestionForContactField(nextContact));
      inputRef.current?.focus?.();
    };
    window.addEventListener('greasy-select-service', handler);
    return () => window.removeEventListener('greasy-select-service', handler);
  }, []);

  useEffect(() => {
    let glowTimeout: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
      setIsGlowing(true);
      if (glowTimeout) clearTimeout(glowTimeout);
      glowTimeout = setTimeout(() => setIsGlowing(false), 1200);
    };
    window.addEventListener('greasy-agent:glow', handler);
    return () => {
      window.removeEventListener('greasy-agent:glow', handler);
      if (glowTimeout) clearTimeout(glowTimeout);
    };
  }, []);
  // Idempotent initial bot message guard
  const didInitRef = useRef(false);

  // Helper to append a model message only if not identical to last model message
  const pushModel = (text: string, link?: MessageLink) => {
    setMessages(prevMsgs => {
      const last = prevMsgs[prevMsgs.length - 1];
      const sameText = last && last.role === 'model' && last.text.trim() === text.trim();
      const sameLink = link ? last?.link?.href === link.href && last?.link?.label === link.label : !last?.link;
      if (sameText && sameLink) return prevMsgs;
      const next: Message = { role: 'model', text };
      if (link) next.link = link;
      return [...prevMsgs, next];
    });
  };

  const hasSentHandoffRef = useRef(false);
  const sendHandoffOnce = (opts: { serviceLabel?: string | null; moveForward?: MoveForward; needsOfficeReview?: boolean }) => {
    if (hasSentHandoffRef.current) return;
    const link = getHandoffLink(opts.serviceLabel ?? null) || undefined;
    const msg = getHandoffMessage(opts);
    if (msg && msg.trim()) pushModel(msg, link);
    hasSentHandoffRef.current = true;
  };
  const [intake, setIntake] = useState<IntakeState>({
    business_name: '',
    address_line: '',
    city: '',
    state: '',
    zip: '',
    system_type: '',
    gallons: '',
    parking_distance: '',
    last_service_months: '',
    additional_services: '',
    wants_to_move_forward: 'UNSURE',
  });

  const [contact, setContact] = useState<ContactState>({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem('ais_chat_history');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  // isLoading: UI-disable flag during request handling (blocks send button)
  const [isLoading, setIsLoading] = useState(false);
  // isBotProcessing: drives the Thinking bubble; true only while bot is actively processing a user message
  const [isBotProcessing, setIsBotProcessing] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<EstimationResult | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isNearBottomRef = useRef(true);
  const isProcessingRef = useRef(false);
  const hasSentEstimateRef = useRef(false);
  const hasSentLeadRef = useRef(false);
  const currentEstimateRef = useRef<EstimationResult | null>(null);
  const hasAskedMoveForwardRef = useRef(false);
  const didShowEstimateDeliveryIntroRef = useRef(false);
  const phaseRef = useRef<'intake' | 'contact'>('intake');
  const geminiDisabledRef = useRef(false);

  // Keep latest state in refs to avoid stale closures
  const intakeRef = useRef<IntakeState>(intake);
  const contactRef = useRef<ContactState>(contact);

  useEffect(() => {
    intakeRef.current = intake;
  }, [intake]);

  useEffect(() => {
    contactRef.current = contact;
  }, [contact]);

  useEffect(() => {
    currentEstimateRef.current = currentEstimate;
  }, [currentEstimate]);

  const updateNearBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 80;
  };

  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  };

  // Persist chat history for continuity across refreshes
  useEffect(() => {
    try {
      sessionStorage.setItem('ais_chat_history', JSON.stringify(messages));
    } catch {
      // Ignore storage errors (e.g., private mode)
    }
  }, [messages]);

  const getFirstMissingField = (obj: IntakeState): IntakeField | null => {
    if (!obj.business_name.trim()) return 'business_name';
    if (!obj.address_line.trim()) return 'address_line';
    if (!obj.city.trim()) return 'city';
    if (!obj.state.trim()) return 'state';
    if (!obj.zip.trim()) return 'zip';
    if (!obj.system_type.trim()) return 'system_type';
    const isGreaseTrap = obj.system_type === ServiceType.GREASE_TRAP;
    if (!isGreaseTrap && !obj.gallons.trim()) return 'gallons';
    if (!obj.parking_distance.trim()) return 'parking_distance';
    if (!obj.last_service_months.trim()) return 'last_service_months';
    if (!obj.additional_services.trim()) return 'additional_services';
    return null;
  };

  const getFirstMissingContactField = (obj: ContactState): ContactField | null => {
    if (!obj.contact_name.trim()) return 'contact_name';
    if (!obj.contact_phone.trim()) return 'contact_phone';
    if (!obj.contact_email.trim()) return 'contact_email';
    return null;
  };

  const getQuestionForField = (field: IntakeField) => {
    switch (field) {
      case 'business_name':
        return 'What is your business name?';
      case 'address_line':
        return 'What is the street address?';
      case 'city':
        return 'What city is this in?';
      case 'state':
        return 'What state is this in?';
      case 'zip':
        return 'What is the ZIP code?';
      case 'system_type':
        return 'What system do you have?';
      case 'gallons':
        return 'How many gallons does the system hold?';
      case 'parking_distance':
        return 'What is the parking distance (in feet)?';
      case 'last_service_months':
        return 'How many months since your last service?';
      case 'additional_services':
        return 'Any additional services?';
      default:
        return '';
    }
  };

  const getQuestionForContactField = (field: ContactField) => {
    switch (field) {
      case 'contact_name':
        return 'What is the best contact name?';
      case 'contact_phone':
        return 'What is the best phone number?';
      case 'contact_email':
        return 'What is the best email address?';
      default:
        return '';
    }
  };

  const isIntakeComplete = (state?: IntakeState) => !getFirstMissingField(state ?? intakeRef.current);
  const isContactComplete = (state?: ContactState) => !getFirstMissingContactField(state ?? contactRef.current);
  const canShowMoveForwardPrompt = (estimate?: EstimationResult | null, intakeState?: IntakeState, contactState?: ContactState) => {
    const hasEstimate = !!(estimate ?? currentEstimateRef.current);
    const isCoreServiceFlow = !!selectedServiceLabelRef.current;
    return hasEstimate && !isCoreServiceFlow && isIntakeComplete(intakeState) && isContactComplete(contactState);
  };

  const makeManualQuoteEstimate = (): EstimationResult => ({
    minPrice: 0,
    maxPrice: 0,
    distance: 0,
    appliedDiscount: 0,
    discountType: '',
    notes: [],
    hydroJetRequired: false,
    breakdown: {
      thresholdMi: 0,
      surchargePerMi: 0,
      milesFromHQ: 0,
      distanceFee: 0,
      hoseFee: 0,
      subtotalBeforeBuffer: 0,
    },
    manualQuote: true,
  });

  const getSuggestions = () => {
    const nextField = getFirstMissingField(intake);
    if (nextField === 'system_type') {
      return [
        { label: 'Grease Trap (Indoor)', value: ServiceType.GREASE_TRAP },
        { label: 'Interceptor', value: ServiceType.INTERCEPTOR },
        { label: 'Clarifier', value: ServiceType.CLARIFIER },
      ];
    }
    if (nextField === 'additional_services') {
      return ['Hydrojetting', 'Grease Break Down', 'Lid Removal'];
    }
    if (nextField === 'gallons') {
      return [
        { label: '300 gal', value: '300' },
        { label: '600 gal', value: '600' },
        { label: '1000 gal', value: '1000' },
        { label: '1600 gal', value: '1600' },
        { label: '2500+ gal', value: '2500' },
        { label: 'Unsure', value: 'UNSURE' },
      ];
    }
    if (nextField === 'last_service_months') return [{ label: '0–3 mo', value: '3' }, { label: '4–6 mo', value: '6' }, { label: '7–12 mo', value: '12' }, { label: '13+ mo', value: '24' }];
    if (nextField === 'parking_distance') return ['50', '100', '150', '200', 'Unsure'];
    if (canShowMoveForwardPrompt(currentEstimate, intake, contact) && intake.wants_to_move_forward === 'UNSURE') return ['Yes, move forward', 'Not right now'];
    return [];
  };

  const maybeSendEstimateLead = () => {
    if (hasSentLeadRef.current) return;
    const serviceLabel = selectedServiceLabelRef.current;
    const isContactOnlyCore = isContactOnlyService(serviceLabel);
    let estimate = currentEstimateRef.current;
    if (!estimate && isContactOnlyCore) {
      const manual = makeManualQuoteEstimate();
      setCurrentEstimate(manual);
      currentEstimateRef.current = manual;
      estimate = manual;
    }
    const needsOfficeReview = !!(estimate && (estimate.manualQuote || (estimate as any).officeReview || (estimate as any).ballpark));
    const moveForward = normalizeMoveForward(intakeRef.current?.wants_to_move_forward);
    if (!estimate) return;
    const missingIntake = getFirstMissingField(intakeRef.current);
    const missingContact = getFirstMissingContactField(contactRef.current);
    if (missingContact) return;
    if (missingIntake && !(estimate.manualQuote && selectedServiceLabelRef.current)) return;

    hasSentLeadRef.current = true;

    const systemLabel = intakeRef.current.system_type === ServiceType.GREASE_TRAP
      ? 'Grease Trap (Indoor)'
      : undefined;

    // Ensure meta exists and extend
    let meta: any = {};
    if (estimate && (estimate as any).meta && typeof (estimate as any).meta === 'object') {
      meta = { ...(estimate as any).meta };
    }
    if (selectedServiceLabelRef.current) {
      meta.service = selectedServiceLabelRef.current;
      meta.source = 'core-services';
    } else {
      meta.source = meta.source ?? 'greasy-agent';
    }
    const payload = {
      intake: {
        ...intakeRef.current,
        system_label: systemLabel,
      },
      contact: contactRef.current,
      estimate: {
        ...estimate,
        distanceMiles: estimate.distanceMiles ?? estimate.distance,
        distanceSource: estimate.distanceSource || 'computed',
        distance_source: estimate.distanceSource || 'computed',
        assumptions: estimate.assumptions || [],
        radiusBand: estimate.radiusBand,
        radius_band: (estimate as any).radius_band ?? estimate.radiusBand,
        distanceAssumed: estimate.distanceAssumed,
        tierUsed: estimate.tierUsed,
        gallonsUncertain: estimate.gallonsUncertain,
        addOns: estimate.addOns,
        add_ons: (estimate as any).add_ons ?? estimate.addOns,
        unknownAddOns: estimate.unknownAddOns,
        manualQuote: estimate.manualQuote,
        manual_quote: (estimate as any).manual_quote ?? estimate.manualQuote,
        capacity_tier: (estimate as any).capacity_tier,
        capacity_unsure: (estimate as any).capacity_unsure,
        baseServiceLabel: estimate.baseServiceLabel,
        baseServicePrice: estimate.baseServicePrice,
        totalPrice: estimate.totalPrice,
      },
      meta,
      createdAt: new Date().toISOString(),
    };

    if (IS_E2E && typeof window !== 'undefined') {
      (window as any).__lastLeadPayload = payload;
    }

    const body = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const success = navigator.sendBeacon('/api/estimate', new Blob([body], { type: 'application/json' }));
      if (success) {
        sendHandoffOnce({ serviceLabel, moveForward, needsOfficeReview });
        selectedServiceLabelRef.current = null;
        return;
      }
    }

    try {
      fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
        .then(res => {
          if (res.ok) {
            sendHandoffOnce({ serviceLabel, moveForward, needsOfficeReview });
            selectedServiceLabelRef.current = null;
          }
        })
        .catch(err => console.error('Failed to send estimate lead:', err));
    } catch (err) {
      console.error('Failed to send estimate lead:', err);
    }
  };

  useEffect(() => {
    if (!IS_E2E || typeof window === 'undefined') return;
    (window as any).__setContactState = (data: Partial<ContactState>) => {
      contactRef.current = { ...contactRef.current, ...data } as ContactState;
      setContact(contactRef.current);
    };
    (window as any).__triggerLeadSend = () => maybeSendEstimateLead();
  }, []);

  // Orchestrate intake after AI JSON is parsed
  const orchestrateIntake = (aiJson: any) => {
    console.count('orchestrateIntake');
    console.debug('orchestrateIntake: nextIntake', getFirstMissingField(intakeRef.current), 'nextContact', getFirstMissingContactField(contactRef.current), 'hasSentEstimate', hasSentEstimateRef.current, 'hasAskedMoveForward', hasAskedMoveForwardRef.current);
    const merged: IntakeState = { ...intakeRef.current };
    (Object.keys(merged) as IntakeField[]).forEach((key) => {
      const v = aiJson?.[key];
      if (isNonEmptyValue(v)) {
        if ((key === 'gallons' || key === 'parking_distance') && typeof v === 'string' && isUnsureValue(v)) {
          merged[key] = 'UNSURE';
        } else if (key === 'wants_to_move_forward') {
          merged[key] = v === true || v === 'true' ? true : v === false || v === 'false' ? false : 'UNSURE';
        } else {
          merged[key] = String(v);
        }
      }
    });
    console.debug('Intake state after merge:', merged);
    // Optional service-area gate: if state is provided and not CA, skip quoting but still capture lead.
    const st = merged.state.trim().toUpperCase();
    const outOfArea = st.length > 0 && st !== 'CA' && st !== 'CALIFORNIA';
    const nextField = outOfArea ? null : getFirstMissingField(merged);
    setIntake(merged);
    intakeRef.current = merged;
    console.debug('Next missing field:', nextField, 'outOfArea:', outOfArea);
    if (nextField) pushModel(getQuestionForField(nextField));
    if (outOfArea) {
      phaseRef.current = 'contact';
      const nextContact = getFirstMissingContactField(contactRef.current);
      pushModel('We currently service Los Angeles County, CA. If you’d like, leave your contact info and our office can advise next steps.');
      if (nextContact) pushModel(getQuestionForContactField(nextContact));
    }
    if (!nextField && !outOfArea) {
      phaseRef.current = 'contact';
      const nextContact = getFirstMissingContactField(contactRef.current);
      if (nextContact) pushModel(getQuestionForContactField(nextContact));
    }
  };

  const orchestrateContact = (aiJson: any) => {
    console.count('orchestrateContact');
    console.debug('orchestrateContact: nextIntake', getFirstMissingField(intakeRef.current), 'nextContact', getFirstMissingContactField(contactRef.current), 'hasSentEstimate', hasSentEstimateRef.current, 'hasAskedMoveForward', hasAskedMoveForwardRef.current);
    phaseRef.current = 'contact';
    const merged: ContactState = { ...contactRef.current };
    (Object.keys(merged) as ContactField[]).forEach((key) => {
      const v = aiJson?.[key];
      if (isNonEmptyValue(v)) merged[key] = String(v);
    });
    console.debug('Contact state after merge:', merged);
    const next = getFirstMissingContactField(merged);
    setContact(merged);
    contactRef.current = merged;
    console.debug('Next missing contact field:', next);
    if (next) pushModel(getQuestionForContactField(next));
    else {
      const st = intakeRef.current.state.trim().toUpperCase();
      const outOfArea = st.length > 0 && st !== 'CA' && st !== 'CALIFORNIA';
      if (!outOfArea) {
        const unknownGallons = intakeRef.current.gallons === 'UNSURE';
        const unknownParking = intakeRef.current.parking_distance === 'UNSURE';
        const estimationInputs: EstimationInputs = {
          serviceType: intakeRef.current.system_type as ServiceType,
          tierKey: 'matrix',
          frequency: Frequency.MONTHLY,
          isOpeningSoon: false,
          parkingDistance: unknownParking ? 100 : Number(intakeRef.current.parking_distance) || 0,
          gallons: unknownGallons ? 0 : Number(intakeRef.current.gallons) || 0,
          additionalServices: parseAdditionalServices(intakeRef.current.additional_services),
        };
        const estimate = calculateServiceEstimate(estimationInputs);
        setCurrentEstimate(estimate);
        currentEstimateRef.current = estimate;
        const needsOfficeReview = !!(estimate.manualQuote || (estimate as any).officeReview || (estimate as any).ballpark);
        if (!needsOfficeReview) {
          const formatted = formatEstimateForChat(estimate);
          if (formatted) {
            pushModel(`ESTIMATE SUMMARY\n\n${formatted}`);
            scrollToBottom();
          }
          pushModel('Final pricing is confirmed after office verification.');
          if (!hasAskedMoveForwardRef.current && canShowMoveForwardPrompt(estimate)) {
            hasAskedMoveForwardRef.current = true;
            pushModel('Do you want to move forward?\n\nIf yes, our office will reach out to you to set up the service.');
          }
        }
        hasSentEstimateRef.current = true;
      } else {
        // Out of area; rely on lead handoff for follow-up
      }
      maybeSendEstimateLead();
    }
  };

  const extractTextFromGeminiResponse = (resp: any): string => {
    if (!resp) return '';
    if (typeof resp.text === 'string') return resp.text;
    if (typeof resp.text === 'function') return resp.text();
    const parts = resp?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      return parts.map((p: any) => p?.text).filter(Boolean).join('');
    }
    return '';
  };

  const stripFencedJson = (s: string) => {
    const t = s.trim();
    const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return fence ? fence[1].trim() : t;
  };

  const formatEstimateForChat = (estimate: EstimationResult | null) => {
    if (!estimate) return '';
    if (estimate.manualQuote) return '';
    const lines: string[] = [];
    const toMoney = (n: number | undefined | null) => typeof n === 'number' && !Number.isNaN(n) ? n.toFixed(2) : '0.00';
    if (estimate.baseServiceLabel && typeof estimate.baseServicePrice === 'number') {
      lines.push(`${estimate.baseServiceLabel}: $${toMoney(estimate.baseServicePrice)}`);
    }
    (estimate.addOns || []).forEach(add => {
      lines.push(`+ ${add.name.replace(/\b\w/g, c => c.toUpperCase())}: $${toMoney(add.price)}`);
    });
    const total = typeof estimate.totalPrice === 'number' ? estimate.totalPrice : estimate.minPrice;
    lines.push(`Total estimate: $${toMoney(total)}`);
    return lines.join('\n');
  };

  // IMPORTANT: The local, Gemini-independent flow below is intentional and must NOT be removed.
const processMessage = async (text: string) => {
  const cleanText = text.trim();
  if (!cleanText) return;
  if (isProcessingRef.current) return;
  isProcessingRef.current = true;
  console.count('processMessage');
  console.debug('processMessage:start nextIntake', getFirstMissingField(intakeRef.current), 'nextContact', getFirstMissingContactField(contactRef.current), 'hasSentEstimate', hasSentEstimateRef.current, 'hasAskedMoveForward', hasAskedMoveForwardRef.current);
  const sanitizedText = stripFillers(cleanText);
  setIsBotProcessing(true);

  const inContactPhase = phaseRef.current === 'contact';
  const expectedField = inContactPhase ? null : getFirstMissingField(intakeRef.current);
  const expectedContactField = expectedField ? null : getFirstMissingContactField(contactRef.current);
  const expectedQuestion = expectedField
    ? getQuestionForField(expectedField)
    : expectedContactField
      ? getQuestionForContactField(expectedContactField)
      : null;

  setMessages(prev => [...prev, { role: 'user', text: cleanText }]);
  setInput('');
  setIsLoading(true);
  console.debug('isLoading -> true');

  if (currentEstimateRef.current && intakeRef.current.wants_to_move_forward === 'UNSURE') {
    const intent = parseMoveForwardIntent(cleanText);
    if (intent !== null) {
      setIntake(prev => ({ ...prev, wants_to_move_forward: intent }));
      intakeRef.current = { ...intakeRef.current, wants_to_move_forward: intent };
      pushModel(getAck());
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  }

  if (isInterjection(cleanText) && expectedQuestion) {
    console.debug('Interjection detected');
    pushModel(`👋 Hey! Quick question: ${expectedQuestion}`);
    setIsLoading(false);
    setIsBotProcessing(false);
    console.debug('isLoading -> false (interjection)');
    isProcessingRef.current = false;
    return;
  }

  // Deterministic pre-processing for free-text fields before interjection handling or Gemini.
  if (expectedField === 'business_name') {
    const extracted = extractBusinessName(sanitizedText);
    if (extracted && isValidFallback('business_name', extracted)) {
      pushModel(getAck());
      const aiJson: any = { business_name: extracted };
      orchestrateIntake(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted business_name without interjection/Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(`Got it — quick check: ${expectedQuestion}`);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'address_line') {
    if (isValidFallback('address_line', sanitizedText)) {
      pushModel(getAck());
      const aiJson: any = { address_line: sanitizedText };
      orchestrateIntake(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted address_line without interjection/Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(`Got it — quick check: ${expectedQuestion}`);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'system_type') {
    if (cleanText) {
      pushModel(getAck());
      orchestrateIntake({ system_type: cleanText });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted system_type without interjection/Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(`Got it — quick check: ${expectedQuestion}`);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'state') {
    const norm = normalizeStateInput(cleanText);
    if (norm) {
      pushModel(getAck());
      orchestrateIntake({ state: norm });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted state without Gemini');
      return;
    }
    pushModel('Please enter a 2-letter state code (e.g., CA).');
    setIsLoading(false);
    setIsBotProcessing(false);
    isProcessingRef.current = false;
    return;
  } else if (expectedContactField === 'contact_name') {
    const extracted = extractContactName(sanitizedText);
    if (extracted && isValidFallback('contact_name', extracted)) {
      pushModel(getAck());
      const aiJson: any = { contact_name: extracted };
      orchestrateContact(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted contact_name without interjection/Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(`Got it — quick check: ${expectedQuestion}`);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'gallons') {
    if (isUnsureValue(cleanText)) {
      pushModel(getAck());
      orchestrateIntake({ gallons: 'UNSURE' });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted gallons unsure without Gemini');
      return;
    }
    if (/^\d+$/.test(cleanText)) {
      pushModel(getAck());
      orchestrateIntake({ gallons: cleanText });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted gallons without Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(`Got it — quick check: ${expectedQuestion}`);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'last_service_months') {
    if (/^\d+$/.test(cleanText) || isUnsureValue(cleanText)) {
      const val = isUnsureValue(cleanText) ? 'UNSURE' : cleanText;
      pushModel(getAck());
      orchestrateIntake({ last_service_months: val });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted last_service_months without Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(`Got it — quick check: ${expectedQuestion}`);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedContactField === 'contact_phone') {
    const digits = cleanText.replace(/\D/g, '');
    if (digits.length >= 10) {
      pushModel(getAck());
      const aiJson: any = { contact_phone: digits };
      orchestrateContact(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted contact_phone without interjection/Gemini');
      return;
    }
    pushModel('I didn’t catch that. Please enter a 10-digit phone number (numbers only).');
    setIsLoading(false);
    setIsBotProcessing(false);
    isProcessingRef.current = false;
    return;
  } else if (expectedContactField === 'contact_email') {
    if (isValidFallback('contact_email', cleanText)) {
      pushModel(getAck());
      const aiJson: any = { contact_email: cleanText };
      orchestrateContact(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted contact_email without interjection/Gemini');
      return;
    }
    pushModel('That doesn’t look like an email. Please type it like name@domain.com.');
    setIsLoading(false);
    setIsBotProcessing(false);
    isProcessingRef.current = false;
    return;
  }

  try {
    let aiJson: any = {};

    aiJson = {};
    if (!geminiDisabledRef.current) {
      try {
        const systemPrompt = `You are an intake interpreter. You must ONLY return valid JSON (no prose, no questions, no markdown) matching this schema and using snake_case keys. Use null for unknown.\n\nSchema:\n{\n  \"business_name\": string | null,\n  \"address_line\": string | null,\n  \"city\": string | null,\n  \"state\": string | null,\n  \"zip\": string | null,\n  \"system_type\": string | null,\n  \"gallons\": string | null,\n  \"parking_distance\": string | null,\n  \"last_service_months\": string | null,\n  \"additional_services\": string | null,\n  \"contact_name\": string | null,\n  \"contact_phone\": string | null,\n  \"contact_email\": string | null\n}`;
        const resp = await Promise.race([
          fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: cleanText, systemPrompt }),
          }).then(r => r.json()),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), 8000)),
        ]);
        if (!resp || !resp.ok) {
          if (resp && resp.disabled) {
            geminiDisabledRef.current = true;
          }
          aiJson = {};
        } else {
          try {
            aiJson = resp.text ? JSON.parse(resp.text) : {};
          } catch (err) {
            console.error('AI JSON parse failed:', err, resp.text);
            aiJson = {};
          }
        }
      } catch (err: any) {
        if (err && (err.status === 401 || err.status === 403)) {
          geminiDisabledRef.current = true;
        }
        aiJson = {};
      }
    }

    // Deterministic fallback: if AI omitted the *expected* next field, use the user's raw input for that field.
    const intakeIncomplete = !!expectedField;

    if (intakeIncomplete && expectedField && !isNonEmptyValue(aiJson?.[expectedField])) {
      const fieldKey = expectedField as IntakeField;
      if (isValidFallback(fieldKey, cleanText)) {
        if (fieldKey === 'state') {
          const normState = normalizeStateInput(cleanText);
          if (!normState) {
            if (expectedQuestion) pushModel(`Got it — quick check: ${expectedQuestion}`);
            setIsLoading(false);
            setIsBotProcessing(false);
            isProcessingRef.current = false;
            return;
          }
          aiJson[fieldKey] = normState;
        } else {
          aiJson[fieldKey] = isUnsureValue(cleanText) ? 'UNSURE' : cleanText;
        }
      } else {
        if (expectedQuestion) pushModel(`Got it — quick check: ${expectedQuestion}`);
        setIsLoading(false);
        setIsBotProcessing(false);
        isProcessingRef.current = false;
        return;
      }
    } else if (!intakeIncomplete && expectedContactField && !isNonEmptyValue(aiJson?.[expectedContactField])) {
      if (isValidFallback(expectedContactField, cleanText)) {
        aiJson[expectedContactField] = cleanText;
      } else {
        if (expectedQuestion) pushModel(`Got it — quick check: ${expectedQuestion}`);
        setIsLoading(false);
        setIsBotProcessing(false);
        isProcessingRef.current = false;
        return;
      }
    }

    console.log('gemini parsed keys', Object.keys(aiJson || {}));

    if (expectedField) orchestrateIntake(aiJson);
    else orchestrateContact(aiJson);
  } catch (err: any) {
    const status = err?.status || err?.code || err?.message;
    if (!geminiDisabledRef.current || (status !== 401 && status !== 403)) {
      console.error('AI call failed:', status || err);
    }
    if (status === 401 || status === 403) {
      geminiDisabledRef.current = true;
    }

    if (expectedField) {
      if (isValidFallback(expectedField, cleanText)) {
        orchestrateIntake({ [expectedField]: isUnsureValue(cleanText) ? 'UNSURE' : cleanText });
        return;
      }
    } else if (expectedContactField) {
      if (expectedContactField === 'contact_phone') {
        const digits = cleanText.replace(/\D/g, '');
        if (digits.length >= 10) {
          orchestrateContact({ contact_phone: digits });
          return;
        }
        pushModel('I didn’t catch that. Please enter a 10-digit phone number (numbers only).');
        setIsLoading(false);
        setIsBotProcessing(false);
        isProcessingRef.current = false;
        return;
      }
      if (expectedContactField === 'contact_email') {
        if (isValidFallback('contact_email', cleanText)) {
          orchestrateContact({ contact_email: cleanText });
          return;
        }
        pushModel('That doesn’t look like an email. Please type it like name@domain.com.');
        setIsLoading(false);
        setIsBotProcessing(false);
        isProcessingRef.current = false;
        return;
      }
      if (isValidFallback(expectedContactField, cleanText)) {
        orchestrateContact({ [expectedContactField]: cleanText });
        return;
      }
    }

    if (expectedQuestion) pushModel(`Got it — quick check: ${expectedQuestion}`);
  } finally {
    setIsLoading(false);
    setIsBotProcessing(false);
    console.debug('isLoading -> false');
    isProcessingRef.current = false;
    console.debug('processMessage:done');
  }
};
// On mount, if no messages, ask for the first missing field (once). Skip when history already exists.
useEffect(() => {
  if (messages.length > 0) return;
  const firstField = getFirstMissingField(intakeRef.current);
  if (!firstField) return;

  const timeoutId = setTimeout(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const firstQuestion = getQuestionForField(firstField);
    const intro = `Hi there! I'm the Greasy Agent. I'll collect a few quick details and give you a service estimate. ${firstQuestion}`;
    pushModel(intro);
  }, 800);

  return () => {
    clearTimeout(timeoutId);
  };
}, [messages.length]);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  // CONTRACT:
  // ChatInterface is responsible ONLY for data collection and UX.
  // Side effects (webhooks, emails, PDFs, storage) must be handled externally.
  return (
    <div
      data-testid={IS_E2E ? 'chat-shell' : undefined}
      data-glowing={IS_E2E ? (isGlowing ? '1' : '0') : undefined}
      className={`${isGlowing ? 'ring-2 ring-blue-400 shadow-lg' : ''} bg-white rounded-b-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col h-full min-h-0 transition-shadow transition-colors duration-300`}
    >
      <div
        ref={scrollContainerRef}
        onScroll={updateNearBottom}
        className="flex flex-col flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 bg-white"
      >
        {messages.length === 0 ? (
          <div className="text-sm text-slate-400 font-semibold">Share your site details to get an estimate.</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}
              >
                <div>{msg.text}</div>
                {msg.role === 'model' && msg.link ? (
                  <div className="mt-3">
                    <a
                      href={msg.link.href}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-widest border border-amber-100 hover:bg-amber-100 shadow-sm"
                    >
                      <i className="fas fa-phone" aria-hidden="true"></i>
                      <span>{msg.link.label}</span>
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}

        {isBotProcessing && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm bg-slate-100 text-slate-900">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                </span>
                <span className="text-slate-500">Thinking…</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {!isLoading && getSuggestions().length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 bg-white/80 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2 shrink-0">
          {getSuggestions().map((chip: any, idx) => {
            const label = typeof chip === 'string' ? chip : chip.label;
            const value = typeof chip === 'string' ? chip : chip.value;
            return (
            <button
              key={idx}
              type="button"
              onClick={() => processMessage(value)}
              className="inline-block px-5 py-2.5 bg-white hover:bg-slate-950 hover:text-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 transition-all active:scale-95 shadow-sm"
            >
              {label}
            </button>
            );
          })}
        </div>
      )}

      <form
        className="p-6 border-t border-slate-100 bg-white shrink-0"
        onSubmit={e => {
          e.preventDefault();
          if (isLoading) return; // guard
          processMessage(inputRef.current?.value || '');
        }}
      >
        <div className="flex gap-3">
          <button
            title="Reset"
            type="button"
            onClick={() => {
              if (window.confirm('Reset?')) {
                sessionStorage.removeItem('ais_chat_history');
                phaseRef.current = 'intake';
                window.location.reload();
              }
            }}
            className="w-12 h-12 rounded-xl text-slate-300 hover:text-red-500 transition-all flex items-center justify-center"
          >
            <i className="fas fa-rotate-left" aria-label="Reset"></i>
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'Instructions...'}
              className="w-full bg-slate-50 border-2 border-slate-50 focus:border-amber-500 focus:bg-white rounded-xl px-6 py-3.5 text-[14px] font-bold outline-none transition-all shadow-inner"
              disabled={isLoading}
            />
          </div>
          <button
            title="Send"
            type="submit"
            disabled={isLoading || !(inputRef.current?.value?.trim() || input.trim())}
            className={`bg-slate-950 text-white w-14 h-14 rounded-xl flex items-center justify-center shadow-xl hover:bg-black transition-all ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <i className="fas fa-circle-notch fa-spin text-amber-500" aria-label="Loading"></i>
            ) : (
              <i className="fas fa-paper-plane text-amber-500" aria-label="Send"></i>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};


