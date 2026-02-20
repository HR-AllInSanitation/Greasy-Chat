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
  last_cleaned_at: string;
  needs_uco: string;
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
type Language = 'en' | 'es';

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

const getHandoffMessage = (
  opts: { serviceLabel?: string | null; moveForward?: MoveForward; needsOfficeReview?: boolean },
  language: Language | null = 'en',
): string => {
  const label = opts.serviceLabel ? ` for "${opts.serviceLabel}"` : '';
  if (opts.moveForward === true) {
    return `Perfect — we’ll take it from here${label}. Our office will reach out soon.`;
  }
  if (opts.needsOfficeReview) {
    return `Thanks — request received${label}. This needs a quick office review, and we’ll contact you soon.`;
  }
  return `Thanks — request received${label}. If you’d like to move forward, reply YES and our office will reach out to schedule.`;
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

const parseAddressInput = (input: string): Partial<IntakeState> | null => {
  const cleaned = stripFillers(input);
  if (!cleaned) return null;

  const commaPattern = /^(?<address>.+?),\s*(?<city>[^,]+),\s*(?<state>[A-Za-z]{2}|California)\s*(?<zip>\d{5})?$/i;
  const spacePattern = /^(?<address>\d+\s+.+?)\s+(?<city>[A-Za-z\s]+?)\s+(?<state>[A-Za-z]{2}|California)\s+(?<zip>\d{5})$/i;

  const tryMatch = (pattern: RegExp) => {
    const match = cleaned.match(pattern);
    const groups = match?.groups;
    if (!groups) return null;
    const state = normalizeStateInput(groups.state || '');
    if (!state) return null;
    const address_line = groups.address?.trim();
    const city = groups.city?.trim();
    const zip = groups.zip?.trim();
    if (!address_line || !city) return null;
    return {
      address_line,
      city,
      state,
      zip: zip || undefined,
    } as Partial<IntakeState>;
  };

  return tryMatch(commaPattern) || tryMatch(spacePattern);
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
      const cleaned = clean.replace(/[^\d+]/g, '');
      const normalized = cleaned.endsWith('+') ? cleaned.slice(0, -1) : cleaned;
      if (!/^\d+$/.test(normalized)) return false;
      const n = Number(normalized);
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
    case 'last_cleaned_at':
      return clean.length > 0 && !isInterjection(clean);
    case 'needs_uco': {
      const lower = clean.toLowerCase();
      if (isUnsureValue(clean)) return true;
      return ['yes', 'no', 'y', 'n', 'true', 'false'].includes(lower);
    }
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

const detectLanguageChoice = (text: string): Language | null => {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (/(espanol|español|spanish|es)/i.test(t)) return 'es';
  if (/(english|inglés|ingles|en)/i.test(t)) return 'en';
  return null;
};

// **NEW**: Multi-field contact parsing helper
// Extract email, phone, and name from a single message (e.g., "john@example.com 555-123-4567 John Smith")
interface MultiFieldContact {
  email?: string;
  phone?: string;
  name?: string;
  extracted: boolean;
}

const tryParseMultiFieldContact = (text: string): MultiFieldContact => {
  const trimmed = text.trim();
  let email: string | undefined;
  let phone: string | undefined;
  let name: string | undefined;

  // Extract email
  const emailMatch = trimmed.match(/([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    email = emailMatch[1];
  }

  // Extract phone (10+ digits)
  const phoneMatch = trimmed.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})/);
  if (phoneMatch) {
    phone = phoneMatch[0].replace(/\D/g, '');
  }

  // Extract name: remove email and phone, take remaining text
  let remaining = trimmed;
  if (email) remaining = remaining.replace(email, '');
  if (phone) remaining = remaining.replace(phoneMatch![0], '');
  remaining = remaining.trim();
  if (remaining.length >= 2 && /[a-zA-Z]/.test(remaining)) {
    name = remaining;
  }

  const extracted = !!(email || phone || name);
  return { email, phone, name, extracted };
};

  const parseGallonsInput = (raw: string): { raw: string; num: number; plus: boolean; status: string } => {
    const t = raw.trim();

    // Check for unsure markers
    if (isUnsureValue(t)) {
      return { raw: t, num: 0, plus: false, status: 'unsure' };
    }

    // Handle "2500+" / "2,500+" / "2500+ gal" formats
    const hasPlusFlag = /\+/.test(t);
    const cleaned = t.replace(/[^\d]/g, '');

    // Try to parse as number
    if (/^\d+$/.test(cleaned)) {
      const num = Number(cleaned);
      if (num > 0 && num <= 20000) {
        if (import.meta.env.DEV) {
          console.log('GALLONS_PARSE', { raw: t, num, plus: hasPlusFlag, status: 'success' });
        }
        return { raw: t, num, plus: hasPlusFlag, status: 'success' };
      }
    }

    // Fallback: could not parse
    if (import.meta.env.DEV) {
      console.log('GALLONS_PARSE', { raw: t, num: 0, plus: false, status: 'parse_failed' });
    }
    return { raw: t, num: 0, plus: false, status: 'parse_failed' };
  };
const getAck = (language: Language | null = 'en') => {
  const acksEn = ['Got it 👍', 'Thanks!', 'Perfect.', 'Confirmed!', 'Received!'];
  const acksEs = ['Listo 👍', '¡Gracias!', 'Perfecto.', 'Confirmado.', '¡Recibido!'];
  const acks = language === 'es' ? acksEs : acksEn;
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
  // **NEW**: Stable quoteId for 2-event architecture (Event A + Event B use same quoteId)
  const quoteIdRef = useRef<string>(generateQuoteId());
  const [language, setLanguage] = useState<Language | null>(IS_E2E ? 'en' : null);
  const languageRef = useRef<Language | null>(IS_E2E ? 'en' : null);
  const t = (en: string, es: string) => (languageRef.current === 'es' ? es : en);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

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
        pushModel(t(`Updated — noted request for "${normalizedLabel}".`, `Actualizado — solicitud registrada para "${normalizedLabel}".`));
      }

      if (isEstimatorLabel) {
        phaseRef.current = 'intake';
        const updatedIntake = { ...intakeRef.current, system_type: ServiceType.GREASE_TRAP } as IntakeState;
        intakeRef.current = updatedIntake;
        setIntake(updatedIntake);
        const next = getFirstMissingField(updatedIntake);
        if (next) pushModel(getQuestionForField(next, languageRef.current));
        inputRef.current?.focus?.();
        return;
      }

      // Contact-only or other core services
      phaseRef.current = 'contact';
      if (!changed) {
        pushModel(
          t(
            `Got it — you're interested in "${normalizedLabel}". Please reply with your name, phone number, and email (you can send all three in one message).`,
            `Entendido — estás interesado en "${normalizedLabel}". Por favor responde con tu nombre, teléfono y correo (puedes enviar los tres en un solo mensaje).`,
          ),
        );
      }

      if (isContactOnlyLabel) {
        const manual = makeManualQuoteEstimate();
        setCurrentEstimate(manual);
        currentEstimateRef.current = manual;
      }

      const nextContact = getFirstMissingContactField(contactRef.current);
      if (nextContact) pushModel(getQuestionForContactField(nextContact, languageRef.current));
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

  // Sci-Fi Blip sound using Web Audio API
  const playRobotBeep = () => {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.value = 1200;
      
      // Filtro para sonido más espacial
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch (err) {
      // Silently fail if audio not supported
    }
  };

  // Helper to append a model message only if not identical to last model message
  const pushModel = (text: string, link?: MessageLink) => {
    setMessages(prevMsgs => {
      const last = prevMsgs[prevMsgs.length - 1];
      const sameText = last && last.role === 'model' && last.text.trim() === text.trim();
      const sameLink = link ? last?.link?.href === link.href && last?.link?.label === link.label : !last?.link;
      if (sameText && sameLink) return prevMsgs;
      const next: Message = { role: 'model', text };
      if (link) next.link = link;
      // Play robot sound when bot sends message
      playRobotBeep();
      return [...prevMsgs, next];
    });
  };

  const hasSentHandoffRef = useRef(false);
  const sendHandoffOnce = (opts: { serviceLabel?: string | null; moveForward?: MoveForward; needsOfficeReview?: boolean }) => {
    if (hasSentHandoffRef.current) return;
    const link = getHandoffLink(opts.serviceLabel ?? null) || undefined;
    const msg = getHandoffMessage(opts, languageRef.current);
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
    last_cleaned_at: '',
    needs_uco: '',
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
    if (!obj.last_cleaned_at.trim()) return 'last_cleaned_at';
    if (!obj.needs_uco.trim()) return 'needs_uco';
    return null;
  };

  const getFirstMissingContactField = (obj: ContactState): ContactField | null => {
    if (!obj.contact_name.trim()) return 'contact_name';
    if (!obj.contact_phone.trim()) return 'contact_phone';
    if (!obj.contact_email.trim()) return 'contact_email';
    return null;
  };

  const getQuestionForField = (field: IntakeField, language: Language | null = 'en') => {
    const es = language === 'es';
    switch (field) {
      case 'business_name':
        return es ? '¿Cuál es el nombre de su negocio?' : 'What is your business name?';
      case 'address_line':
        return es ? '¿Cuál es la dirección?' : 'What is the street address?';
      case 'city':
        return es ? '¿En qué ciudad está?' : 'What city is this in?';
      case 'state':
        return es ? '¿En qué estado está?' : 'What state is this in?';
      case 'zip':
        return es ? '¿Cuál es el código postal?' : 'What is the ZIP code?';
      case 'system_type':
        return es ? '¿Qué tipo de sistema tiene?' : 'What system do you have?';
      case 'gallons':
        return es ? '¿Cuántos galones tiene el sistema?' : 'How many gallons does the system hold?';
      case 'parking_distance':
        return es ? '¿Cuál es la distancia de estacionamiento (en pies)?' : 'What is the parking distance (in feet)?';
      case 'last_service_months':
        return es ? '¿Cuántos meses desde su último servicio?' : 'How many months since your last service?';
      case 'additional_services':
        return es ? '¿Algún servicio adicional?' : 'Any additional services?';
      case 'last_cleaned_at':
        return es ? '¿Cuándo fue la última limpieza?' : 'When was the system last cleaned?';
      case 'needs_uco':
        return es ? '¿Necesita reciclaje de aceite usado (UCO)?' : 'Do you need used cooking oil (UCO) recycling?';
      default:
        return '';
    }
  };

  const getQuestionForContactField = (field: ContactField, language: Language | null = 'en') => {
    const es = language === 'es';
    switch (field) {
      case 'contact_name':
        return es ? '¿Cuál es el mejor nombre de contacto?' : 'What is the best contact name?';
      case 'contact_phone':
        return es ? '¿Cuál es el mejor número de teléfono?' : 'What is the best phone number?';
      case 'contact_email':
        return es ? '¿Cuál es la mejor dirección de correo electrónico?' : 'What is the best email address?';
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
        { label: '2500+ gal', value: '2500+' },
        { label: 'Unsure', value: 'UNSURE' },
      ];
    }
    if (nextField === 'last_service_months') return [{ label: '0–3 mo', value: '3' }, { label: '4–6 mo', value: '6' }, { label: '7–12 mo', value: '12' }, { label: '13+ mo', value: '24' }];
    if (nextField === 'parking_distance') return ['50', '100', '150', '200', 'Unsure'];
    if (nextField === 'last_cleaned_at') return ['< 1 year', '1–2 years', '2–5 years', '> 5 years', 'Never', 'Unsure'];
    if (nextField === 'needs_uco') return ['Yes', 'No', 'Unsure'];
    if (canShowMoveForwardPrompt(currentEstimate, intake, contact) && intake.wants_to_move_forward === 'UNSURE') return ['Yes, move forward', 'Not right now'];
    return [];
  };

  const maybeSendEstimateLead = async (leadEvent: 'estimate_created' | 'move_forward_decided' = 'estimate_created') => {
    // For Event A (estimate_created): always send when estimate is ready
    // For Event B (move_forward_decided): send after user clicks YES/NO
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
    
    // Event A: always send (no gate for estimate_created)
    // Event B: gate by explicit YES/NO decision
    if (leadEvent === 'move_forward_decided' && !isContactOnlyCore && moveForward === 'UNSURE') {
      if (import.meta.env.DEV) {
        console.log('LEAD_GATE_EVENT_B', { moveForward, reason: 'awaiting_explicit_decision' });
      }
      return false;
    }

    if (!estimate) return false;
    const missingIntake = getFirstMissingField(intakeRef.current);
    const missingContact = getFirstMissingContactField(contactRef.current);
    if (missingContact) return false;
    if (missingIntake && !(estimate.manualQuote && selectedServiceLabelRef.current)) return false;

    if (import.meta.env.DEV) {
      console.log('LEAD_POST_ATTEMPT', { leadEvent, moveForward, isContactOnly: isContactOnlyCore });
    }

    const systemLabel = intakeRef.current.system_type === ServiceType.GREASE_TRAP
      ? 'Grease Trap (Indoor)'
      : undefined;

    // Build meta with leadEvent and quoteId
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
    
    // **NEW**: Add leadEvent and quoteId to meta
    meta.leadEvent = leadEvent;
    meta.quoteId = quoteIdRef.current;
    
    // Store parsed gallons data for audit trail
    const gallonsParsed = intakeRef.current.gallons ? parseGallonsInput(intakeRef.current.gallons) : null;
    if (gallonsParsed) {
      meta.gallons_raw = gallonsParsed.raw;
      meta.gallons_num = gallonsParsed.num;
      meta.gallons_plus = gallonsParsed.plus;
      meta.gallons_parse_status = gallonsParsed.status;
    }

    const distanceMiles = estimate?.distanceMiles ?? estimate?.distance;
    const radiusBand = estimate?.radiusBand || (estimate as any)?.radius_band;
    const distanceVerified = estimate?.distanceVerified ?? false;
    if (distanceMiles !== undefined && distanceMiles !== null) meta.distance_miles = distanceMiles;
    if (radiusBand) meta.distance_band = radiusBand;
    if (distanceVerified) meta.distance_verified = true;
    if (estimate?.tierUsed) meta.tier_used = estimate.tierUsed;
    if (typeof estimate?.baseServicePrice === 'number') meta.base_price = estimate.baseServicePrice;

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

    if (import.meta.env.DEV) {
      console.log('LEAD_POST_START', { leadEvent, moveForward, serviceLabel, needsOfficeReview, quoteId: quoteIdRef.current });
    }

    // **NEW**: Add user-visible fallback on failure
    let postSuccess = false;

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const success = navigator.sendBeacon('/api/estimate', new Blob([body], { type: 'application/json' }));
      if (success) {
        if (import.meta.env.DEV) {
          console.log('LEAD_POST_RESULT', { method: 'sendBeacon', success: true, leadEvent });
        }
        postSuccess = true;
        sendHandoffOnce({ serviceLabel, moveForward, needsOfficeReview });
        selectedServiceLabelRef.current = null;
        return true;
      }
    }

    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (import.meta.env.DEV) {
        console.log('LEAD_POST_RESULT', { method: 'fetch', status: res.status, ok: res.ok, leadEvent });
      }

      if (res.ok) {
        postSuccess = true;
        sendHandoffOnce({ serviceLabel, moveForward, needsOfficeReview });
        selectedServiceLabelRef.current = null;
        return true;
      } else {
        // **NEW**: Show user-visible fallback message on POST failure
        const officePhone = getOfficePhoneValue().trim();
        if (leadEvent === 'move_forward_decided') {
          const fallback = officePhone
            ? t(
                `We had trouble submitting. Please call/text ${officePhone} or reply to confirm.`,
                `Tuvimos problemas para enviar. Por favor llama o envía un texto a ${officePhone} o responde para confirmar.`,
              )
            : t(
                'We had trouble submitting. Please reply to confirm your request.',
                'Tuvimos problemas para enviar. Responde para confirmar tu solicitud.',
              );
          pushModel(fallback);
        } else if (leadEvent === 'estimate_created') {
          // **HARDENING**: Show fallback for Event A too (though user might not see if they proceed)
          const fallback = officePhone
            ? t(
                `We had trouble recording your estimate. Please call/text ${officePhone} or continue to move forward.`,
                `Tuvimos problemas para registrar tu estimado. Por favor llama o envía un texto a ${officePhone} o continúa para avanzar.`,
              )
            : t(
                'We had trouble recording your estimate. You can continue to move forward.',
                'Tuvimos problemas para registrar tu estimado. Puedes continuar para avanzar.',
              );
          if (import.meta.env.DEV) {
            console.warn('EVENT_A_POST_FAILED', { status: res.status });
          }
          pushModel(fallback);
        }
        if (import.meta.env.DEV) {
          console.log('LEAD_POST_FAILED', { method: 'fetch', status: res.status, leadEvent });
        }
        return false;
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.log('LEAD_POST_ERROR', { method: 'fetch', error: (err as any).message, leadEvent });
      }
      // **NEW**: Show user-visible fallback on error
      const officePhone = getOfficePhoneValue().trim();
      if (leadEvent === 'move_forward_decided') {
        const fallback = officePhone
          ? t(
              `We had trouble submitting. Please call/text ${officePhone} or reply to confirm.`,
              `Tuvimos problemas para enviar. Por favor llama o envía un texto a ${officePhone} o responde para confirmar.`,
            )
          : t(
              'We had trouble submitting. Please reply to confirm your request.',
              'Tuvimos problemas para enviar. Responde para confirmar tu solicitud.',
            );
        pushModel(fallback);
      } else if (leadEvent === 'estimate_created') {
        // **HARDENING**: Show fallback for Event A too
        const fallback = officePhone
          ? t(
              `We had trouble recording your estimate. Please call/text ${officePhone} or continue to move forward.`,
              `Tuvimos problemas para registrar tu estimado. Por favor llama o envía un texto a ${officePhone} o continúa para avanzar.`,
            )
          : t(
              'We had trouble recording your estimate. You can continue to move forward.',
              'Tuvimos problemas para registrar tu estimado. Puedes continuar para avanzar.',
            );
        if (import.meta.env.DEV) {
          console.warn('EVENT_A_POST_ERROR', { error: (err as any).message });
        }
        pushModel(fallback);
      }
      console.error('Failed to send estimate lead:', err);
      return false;
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
    if (nextField) pushModel(getQuestionForField(nextField, languageRef.current));
    if (outOfArea) {
      phaseRef.current = 'contact';
      const nextContact = getFirstMissingContactField(contactRef.current);
      pushModel(
        t(
          'We currently service Los Angeles County, CA. If you’d like, leave your contact info and our office can advise next steps.',
          'Actualmente servimos el Condado de Los Ángeles, CA. Si deseas, deja tu información de contacto y nuestra oficina te puede orientar sobre los siguientes pasos.',
        ),
      );
      if (nextContact) pushModel(getQuestionForContactField(nextContact, languageRef.current));
    }
    if (!nextField && !outOfArea) {
      phaseRef.current = 'contact';
      const nextContact = getFirstMissingContactField(contactRef.current);
      if (nextContact) pushModel(getQuestionForContactField(nextContact, languageRef.current));
    }
  };

  const orchestrateContact = async (aiJson: any) => {
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
    if (next) pushModel(getQuestionForContactField(next, languageRef.current));
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
          // Parse gallons with helper to handle "2,500+" format
          const gallonsParsed = intakeRef.current.gallons ? parseGallonsInput(intakeRef.current.gallons) : { raw: '', num: 0, plus: false, status: 'empty' };
          
          // PHASE 4: Geocode address for verified distance (required for 2,500+ tier)
          let location: { latitude: number; longitude: number; address?: string } | undefined;
          const isGrease4000 = gallonsParsed.plus || gallonsParsed.num > 2500;
          
          if (isGrease4000) {
            try {
              const geoRes = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  addressLine1: intakeRef.current.address_line,
                  city: intakeRef.current.city,
                  state: intakeRef.current.state,
                  zip: intakeRef.current.zip,
                }),
              });
              
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.verified && typeof geoData.lat === 'number' && typeof geoData.lng === 'number') {
                  location = {
                    latitude: geoData.lat,
                    longitude: geoData.lng,
                    address: geoData.normalizedAddress,
                  };
                  if (import.meta.env.DEV) {
                    console.log('GEOCODE_SUCCESS', { lat: geoData.lat, lng: geoData.lng, cached: geoData.cached });
                  }
                } else if (import.meta.env.DEV) {
                  console.warn('GEOCODE_UNVERIFIED', geoData);
                }
              } else if (import.meta.env.DEV) {
                console.warn('GEOCODE_HTTP_ERROR', geoRes.status);
              }
            } catch (err) {
              if (import.meta.env.DEV) {
                console.error('GEOCODE_ERROR', err);
              }
            }
          }
          
          const estimationInputsFixed: EstimationInputs = {
            serviceType: intakeRef.current.system_type as ServiceType,
            tierKey: 'matrix',
            frequency: Frequency.MONTHLY,
            isOpeningSoon: false,
            parkingDistance: unknownParking ? 100 : Number(intakeRef.current.parking_distance) || 0,
            gallons: gallonsParsed.num,
            gallonsPlus: gallonsParsed.plus,
            location,
            additionalServices: parseAdditionalServices(intakeRef.current.additional_services),
          };
          if (import.meta.env.DEV) {
            console.log('ESTIMATE_INPUTS', estimationInputsFixed);
          }
          const estimate = calculateServiceEstimate(estimationInputsFixed);
          const needsOfficeReview = !!(estimate.manualQuote || (estimate as any).officeReview || (estimate as any).ballpark);
          if (import.meta.env.DEV) {
            console.log('ESTIMATE_OUTPUT', { minPrice: estimate.minPrice, maxPrice: estimate.maxPrice, totalPrice: estimate.totalPrice, tierUsed: estimate.tierUsed, manualQuote: estimate.manualQuote, officeReview: (estimate as any).officeReview });
          }
          setCurrentEstimate(estimate);
          currentEstimateRef.current = estimate;
          const includeMoveForward = !needsOfficeReview && canShowMoveForwardPrompt(estimate);
          const formatted = formatEstimateForChat(estimate, languageRef.current, includeMoveForward);
          if (formatted && formatted.trim()) {
            pushModel(formatted);
          }
        // **NEW (Event A)**: Send estimate_created event immediately
        // This captures the lead even if the user closes the page or doesn't respond to Move Forward
        if (!hasSentLeadRef.current) {
          hasSentLeadRef.current = true;
          setTimeout(() => {
            maybeSendEstimateLead('estimate_created').catch(err => {
              console.error('Failed to send Event A (estimate_created):', err);
            });
          }, 100);
        }
        
        if (!hasAskedMoveForwardRef.current && !needsOfficeReview && canShowMoveForwardPrompt(estimate)) {
          hasAskedMoveForwardRef.current = true;
        }
        hasSentEstimateRef.current = true;
      } else {
        // Out of area; rely on lead handoff for follow-up
      }
      
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

  const buildEstimateLineItems = (estimate: EstimationResult, language: Language | null = 'en') => {
    const lines: string[] = [];
    const toMoney = (n: number | undefined | null) => typeof n === 'number' && !Number.isNaN(n) ? n.toFixed(2) : '0.00';
    const hasRange = typeof estimate.minPrice === 'number' && typeof estimate.maxPrice === 'number' && estimate.minPrice !== estimate.maxPrice;
    const total = typeof estimate.totalPrice === 'number' ? estimate.totalPrice : estimate.minPrice;
    const isEs = language === 'es';

    if (estimate.baseServiceLabel && typeof estimate.baseServicePrice === 'number') {
      const baseLabel = isEs ? `Servicio base (${estimate.baseServiceLabel})` : estimate.baseServiceLabel;
      lines.push(`${baseLabel}: $${toMoney(estimate.baseServicePrice)}`);
    }
    (estimate.addOns || []).forEach(add => {
      lines.push(`+ ${add.name.replace(/\b\w/g, c => c.toUpperCase())}: $${toMoney(add.price)}`);
    });
    const totalLabel = isEs ? 'Monto estimado' : 'Estimated total';
    const totalLine = hasRange
      ? `${totalLabel}: $${toMoney(estimate.minPrice)}–$${toMoney(estimate.maxPrice)}`
      : `${totalLabel}: $${toMoney(total)}`;
    lines.push(totalLine);
    if (Array.isArray(estimate.notes)) {
      estimate.notes.filter(Boolean).forEach(note => lines.push(`- ${note}`));
    }

    return lines;
  };

  const formatEstimateForChat = (estimate: EstimationResult | null, language: Language | null = 'en', includeMoveForward = false) => {
    if (!estimate) return '';
    const manualOrReview = estimate.manualQuote === true || (estimate as any).officeReview === true;
    const ballpark = (estimate as any).ballpark === true;
    const isEs = language === 'es';

    if (manualOrReview || ballpark) {
      return isEs
        ? 'Este servicio requiere revisión de oficina. Confirmaremos el precio por teléfono.'
        : 'This request needs office review. We’ll confirm pricing by phone.';
    }

    const lines = buildEstimateLineItems(estimate, language);
    const disclaimer = isEs
      ? 'Este estimado es preliminar y está sujeto a verificación por la oficina. El precio final puede variar según condiciones en sitio, acceso, volumen real o servicios adicionales.'
      : 'This estimate is preliminary and subject to office verification. Final pricing may vary based on on-site conditions, access, actual volume, or additional services.';
    const question = isEs
      ? '¿Deseas continuar? Si respondes que sí, nuestra oficina te contactará para programar el servicio.'
      : 'Do you want to move forward? If yes, our office will reach out to schedule.';

    return [
      ...lines,
      '',
      disclaimer,
      ...(includeMoveForward ? ['', question] : []),
    ].join('\n');
  };

  const buildPinnedSummary = (estimate: EstimationResult | null) => {
    if (!estimate) return null;
    const toMoney = (n: number | undefined | null) => (typeof n === 'number' && !Number.isNaN(n) ? `$${n.toFixed(2)}` : null);
    const manualOrReview = estimate.manualQuote === true || (estimate as any).officeReview === true;
    const ballpark = (estimate as any).ballpark === true;
    const hasRange = typeof estimate.minPrice === 'number' && typeof estimate.maxPrice === 'number' && estimate.minPrice !== estimate.maxPrice;
    const rangeText = hasRange ? `${toMoney(estimate.minPrice)}–${toMoney(estimate.maxPrice)}` : null;
    const amountText = toMoney(typeof estimate.totalPrice === 'number' ? estimate.totalPrice : estimate.minPrice);
    const lines: string[] = [];
    let title = 'Estimate Summary';

    if (manualOrReview || ballpark) {
      title = 'Office review required';
      lines.push('Office will confirm pricing based on exact location.');
      lines.push('We will confirm pricing by phone.');
    } else {
      const formattedLines = buildEstimateLineItems(estimate, languageRef.current);
      if (formattedLines.length) {
        lines.push(...formattedLines);
      }
      if (!lines.length) {
        if (rangeText) lines.push(`Estimate: ${rangeText}`);
        else if (amountText) lines.push(`Estimate: ${amountText}`);
      }
    }

    return { title, lines };
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
    ? getQuestionForField(expectedField, languageRef.current)
    : expectedContactField
      ? getQuestionForContactField(expectedContactField, languageRef.current)
      : null;

  setMessages(prev => [...prev, { role: 'user', text: cleanText }]);
  setInput('');
  setIsLoading(true);
  console.debug('isLoading -> true');

  if (!languageRef.current && !IS_E2E) {
    const choice = detectLanguageChoice(cleanText);
    if (!choice) {
      pushModel('Please reply “Español” or “English”. / Responde “Español” o “English”.');
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
    languageRef.current = choice;
    setLanguage(choice);
    const confirm = choice === 'es' ? '¡Gracias! Comencemos.' : 'Thanks! Let’s get started.';
    pushModel(confirm);
    const firstField = getFirstMissingField(intakeRef.current);
    if (firstField) {
      pushModel(getQuestionForField(firstField, choice));
    }
    setIsLoading(false);
    setIsBotProcessing(false);
    isProcessingRef.current = false;
    return;
  }

  if (currentEstimateRef.current && intakeRef.current.wants_to_move_forward === 'UNSURE') {
    const intent = parseMoveForwardIntent(cleanText);
    if (intent !== null) {
      setIntake(prev => ({ ...prev, wants_to_move_forward: intent }));
      intakeRef.current = { ...intakeRef.current, wants_to_move_forward: intent };
      pushModel(getAck(languageRef.current));
      // **NEW (Event B)**: Send move_forward_decided event when user clicks YES/NO
      setTimeout(() => {
        maybeSendEstimateLead('move_forward_decided').catch(err => {
          console.error('Failed to send Event B (move_forward_decided):', err);
        });
      }, 50);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  }

  if (isInterjection(cleanText) && expectedQuestion) {
    console.debug('Interjection detected');
    pushModel(t(`👋 Hey! Quick question: ${expectedQuestion}`, `👋 ¡Hola! Pregunta rápida: ${expectedQuestion}`));
    setIsLoading(false);
    setIsBotProcessing(false);
    console.debug('isLoading -> false (interjection)');
    isProcessingRef.current = false;
    return;
  }

  if (expectedField && ['address_line', 'city', 'state', 'zip'].includes(expectedField)) {
    const parsedAddress = parseAddressInput(sanitizedText);
    if (parsedAddress && parsedAddress.address_line && parsedAddress.city && parsedAddress.state) {
      pushModel(getAck(languageRef.current));
      orchestrateIntake(parsedAddress);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Parsed full address without interjection/Gemini');
      return;
    }
  }

  // Deterministic pre-processing for free-text fields before interjection handling or Gemini.
  if (expectedField === 'business_name') {
    const extracted = extractBusinessName(sanitizedText);
    if (extracted && isValidFallback('business_name', extracted)) {
      pushModel(getAck(languageRef.current));
      const aiJson: any = { business_name: extracted };
      orchestrateIntake(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted business_name without interjection/Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'address_line') {
    if (isValidFallback('address_line', sanitizedText)) {
      pushModel(getAck(languageRef.current));
      const aiJson: any = { address_line: sanitizedText };
      orchestrateIntake(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted address_line without interjection/Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'system_type') {
    if (cleanText) {
      pushModel(getAck(languageRef.current));
      orchestrateIntake({ system_type: cleanText });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted system_type without interjection/Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'state') {
    const norm = normalizeStateInput(cleanText);
    if (norm) {
      pushModel(getAck(languageRef.current));
      orchestrateIntake({ state: norm });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted state without Gemini');
      return;
    }
    pushModel(t('Please enter a 2-letter state code (e.g., CA).', 'Por favor ingresa el código de estado de 2 letras (por ejemplo, CA).'));
    setIsLoading(false);
    setIsBotProcessing(false);
    isProcessingRef.current = false;
    return;
  } else if (expectedContactField === 'contact_name') {
    // **NEW**: Try multi-field extraction first (email + phone + name in one message)
    const multiField = tryParseMultiFieldContact(cleanText);
    if (multiField.extracted && (multiField.email || multiField.phone || multiField.name)) {
      const extracted: any = {};
      if (multiField.name) extracted.contact_name = multiField.name;
      if (multiField.email) extracted.contact_email = multiField.email;
      if (multiField.phone) extracted.contact_phone = multiField.phone;
      
      if (import.meta.env.DEV) {
        console.log('MULTI_FIELD_CONTACT_PARSE', { extracted });
      }
      
      pushModel(getAck(languageRef.current));
      orchestrateContact(extracted);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Multi-field contact extraction successful');
      return;
    }
    
    // Fallback to single-field parsing
    const extracted = extractContactName(sanitizedText);
    if (extracted && isValidFallback('contact_name', extracted)) {
      pushModel(getAck(languageRef.current));
      const aiJson: any = { contact_name: extracted };
      orchestrateContact(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted contact_name without interjection/Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'gallons') {
    if (isUnsureValue(cleanText)) {
      pushModel(getAck(languageRef.current));
      orchestrateIntake({ gallons: 'UNSURE' });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted gallons unsure without Gemini');
      return;
    }
    const parsedGallons = parseGallonsInput(cleanText);
    if (parsedGallons.status === 'success') {
      pushModel(getAck(languageRef.current));
      const normalizedGallons = parsedGallons.plus ? `${parsedGallons.num}+` : String(parsedGallons.num);
      orchestrateIntake({ gallons: normalizedGallons });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted gallons without Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'last_service_months') {
    if (/^\d+$/.test(cleanText) || isUnsureValue(cleanText)) {
      const val = isUnsureValue(cleanText) ? 'UNSURE' : cleanText;
      pushModel(getAck(languageRef.current));
      orchestrateIntake({ last_service_months: val });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted last_service_months without Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'last_cleaned_at') {
    if (isValidFallback('last_cleaned_at', cleanText)) {
      pushModel(getAck(languageRef.current));
      orchestrateIntake({ last_cleaned_at: cleanText });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted last_cleaned_at without Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedField === 'needs_uco') {
    const lower = cleanText.trim().toLowerCase();
    const normalized = isUnsureValue(cleanText)
      ? 'UNSURE'
      : (['yes', 'y', 'true'].includes(lower) ? 'YES' : ['no', 'n', 'false'].includes(lower) ? 'NO' : '');
    if (normalized) {
      pushModel(getAck(languageRef.current));
      orchestrateIntake({ needs_uco: normalized });
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted needs_uco without Gemini');
      return;
    }
    if (expectedQuestion) {
      pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      return;
    }
  } else if (expectedContactField === 'contact_phone') {
    const digits = cleanText.replace(/\D/g, '');
    if (digits.length >= 10) {
      pushModel(getAck(languageRef.current));
      const aiJson: any = { contact_phone: digits };
      orchestrateContact(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted contact_phone without interjection/Gemini');
      return;
    }
    pushModel(t('I didn’t catch that. Please enter a 10-digit phone number (numbers only).', 'No logré entender. Por favor ingresa un número de teléfono de 10 dígitos (solo números).'));
    setIsLoading(false);
    setIsBotProcessing(false);
    isProcessingRef.current = false;
    return;
  } else if (expectedContactField === 'contact_email') {
    if (isValidFallback('contact_email', cleanText)) {
      pushModel(getAck(languageRef.current));
      const aiJson: any = { contact_email: cleanText };
      orchestrateContact(aiJson);
      setIsLoading(false);
      setIsBotProcessing(false);
      isProcessingRef.current = false;
      console.debug('Pre-accepted contact_email without interjection/Gemini');
      return;
    }
    pushModel(t('That doesn’t look like an email. Please type it like name@domain.com.', 'Eso no parece un correo válido. Escríbelo como nombre@dominio.com.'));
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
        const systemPrompt = `You are an intake interpreter. You must ONLY return valid JSON (no prose, no questions, no markdown) matching this schema and using snake_case keys. Use null for unknown.\n\nSchema:\n{\n  \"business_name\": string | null,\n  \"address_line\": string | null,\n  \"city\": string | null,\n  \"state\": string | null,\n  \"zip\": string | null,\n  \"system_type\": string | null,\n  \"gallons\": string | null,\n  \"parking_distance\": string | null,\n  \"last_service_months\": string | null,\n  \"additional_services\": string | null,\n  \"last_cleaned_at\": string | null,\n  \"needs_uco\": string | null,\n  \"contact_name\": string | null,\n  \"contact_phone\": string | null,\n  \"contact_email\": string | null\n}`;
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
            if (expectedQuestion) pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
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
        if (expectedQuestion) pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
        setIsLoading(false);
        setIsBotProcessing(false);
        isProcessingRef.current = false;
        return;
      }
    } else if (!intakeIncomplete && expectedContactField && !isNonEmptyValue(aiJson?.[expectedContactField])) {
      if (isValidFallback(expectedContactField, cleanText)) {
        aiJson[expectedContactField] = cleanText;
      } else {
        if (expectedQuestion) pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
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
        pushModel(t('I didn’t catch that. Please enter a 10-digit phone number (numbers only).', 'No logré entender. Por favor ingresa un número de teléfono de 10 dígitos (solo números).'));
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
        pushModel(t('That doesn’t look like an email. Please type it like name@domain.com.', 'Eso no parece un correo válido. Escríbelo como nombre@dominio.com.'));
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

    if (expectedQuestion) pushModel(t(`Got it — quick check: ${expectedQuestion}`, `Entendido — confirmo: ${expectedQuestion}`));
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
  if (!languageRef.current) {
    const ask = '¿Español o English?';
    pushModel(ask);
    return;
  }
  const firstField = getFirstMissingField(intakeRef.current);
  if (!firstField) return;

  const timeoutId = setTimeout(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const firstQuestion = getQuestionForField(firstField, languageRef.current);
    const intro = languageRef.current === 'es'
      ? `¡Hola! Soy Greasy Agent. Haré unas preguntas rápidas y te daré un estimado de servicio. ${firstQuestion}`
      : `Hi there! I'm the Greasy Agent. I'll collect a few quick details and give you a service estimate. ${firstQuestion}`;
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
  const shellClass = `${isGlowing ? 'ring-2 ring-blue-400 shadow-lg' : ''} bg-white rounded-b-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col h-full min-h-0 transition-shadow transition-colors duration-300`;
  const activeEstimate = currentEstimateRef.current || currentEstimate;
  const pinnedSummary = buildPinnedSummary(activeEstimate);
  const showEstimateCard = false; // Fase E: Disabled pinned card - estimate shown in chat only

  const shellContent = (
    <>
      {showEstimateCard && pinnedSummary && (
        <div className="px-6 pt-5 pb-3 sticky top-0 z-20 bg-gradient-to-b from-white via-white to-white/80 border-b border-slate-100">
          <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-lg flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">EST</div>
            <div className="flex-1">
              <div className="text-xs font-black uppercase tracking-[0.15em] text-amber-200">{pinnedSummary.title}</div>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-relaxed font-semibold">{pinnedSummary.lines.join('\n')}</pre>
              <div className="mt-3 text-xs text-amber-100">Pinned so you can keep the quote handy while chatting.</div>
            </div>
          </div>
        </div>
      )}
      <div
        ref={scrollContainerRef}
        onScroll={updateNearBottom}
        className="flex flex-col flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 bg-white"
      >
        {messages.length === 0 ? (
          <div className="text-sm text-slate-400 font-semibold">Share your site details to get an estimate.</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${msg.role === 'model' ? 'animate-fadeIn' : ''}`}>
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
              placeholder={'Type here...'}
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
    </>
  );

  return IS_E2E ? (
    <div data-testid="chat-shell" data-glowing={isGlowing ? '1' : '0'} className={shellClass}>
      {shellContent}
    </div>
  ) : (
    <div className={shellClass}>
      {shellContent}
    </div>
  );
};


