import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { calculateServiceEstimate } from '../services/pricingEngine';
import { EstimationInputs, EstimationResult, Frequency, LeadInfo, ServiceType } from '../types';

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
}

const isNonEmptyValue = (v: unknown) => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
};

export const ChatInterface: React.FC = () => {
  // Idempotent initial bot message guard
  const didInitRef = useRef(false);

  // Helper to append a model message only if not identical to last model message
  const pushModel = (text: string) => {
    setMessages(prevMsgs => {
      const last = prevMsgs[prevMsgs.length - 1];
      if (last && last.role === 'model' && last.text.trim() === text.trim()) return prevMsgs;
      return [...prevMsgs, { role: 'model', text }];
    });
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
  const [isLoading, setIsLoading] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<EstimationResult | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  // Keep latest state in refs to avoid stale closures
  const intakeRef = useRef<IntakeState>(intake);
  const contactRef = useRef<ContactState>(contact);

  useEffect(() => {
    intakeRef.current = intake;
  }, [intake]);

  useEffect(() => {
    contactRef.current = contact;
  }, [contact]);

  const didInitQuestionRef = useRef(false);

  const getFirstMissingField = (obj: IntakeState): IntakeField | null => {
    if (!obj.business_name.trim()) return 'business_name';
    if (!obj.address_line.trim()) return 'address_line';
    if (!obj.city.trim()) return 'city';
    if (!obj.state.trim()) return 'state';
    if (!obj.zip.trim()) return 'zip';
    if (!obj.system_type.trim()) return 'system_type';
    if (!obj.gallons.trim()) return 'gallons';
    if (!obj.parking_distance.trim()) return 'parking_distance';
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
        return 'What is the system type? (Grease trap, interceptor, etc.)';
      case 'gallons':
        return 'How many gallons does the system hold?';
      case 'parking_distance':
        return 'What is the parking distance (in feet)?';
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

  const getSuggestions = () => {
    const nextField = getFirstMissingField(intake);
    if (nextField === 'parking_distance') {
      return ['50', '100', '150', '200', 'Unsure'];
    }
    return [];
  };

  // Orchestrate intake after AI JSON is parsed
  const orchestrateIntake = (aiJson: any) => {
    console.count('orchestrateIntake');
    const merged: IntakeState = { ...intakeRef.current };
    (Object.keys(merged) as IntakeField[]).forEach((key) => {
      const v = aiJson?.[key];
      if (isNonEmptyValue(v)) merged[key] = String(v);
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
      const nextContact = getFirstMissingContactField(contactRef.current);
      pushModel('We currently service Los Angeles County, CA. If you’d like, leave your contact info and our office can advise next steps.');
      if (nextContact) pushModel(getQuestionForContactField(nextContact));
    }
    if (!nextField && !outOfArea) {
      const estimationInputs: EstimationInputs = {
        gallons: Number(merged.gallons) || 0,
        systemType: merged.system_type as ServiceType,
        parkingDistance: Number(merged.parking_distance) || 0,
        frequency: Frequency.MONTHLY,
        customerLocation: {
          address: `${merged.address_line}, ${merged.city}, ${merged.state} ${merged.zip}`,
        },
        leadInfo: {
          businessName: merged.business_name,
          address: merged.address_line,
          city: merged.city,
          state: merged.state,
          zip: merged.zip,
        } as LeadInfo,
      };
      const estimate = calculateServiceEstimate(estimationInputs);
      const quoteId = generateQuoteId();
      setCurrentEstimate(estimate);
      pushModel('Thank you. Here is your estimate.');
      const nextContact = getFirstMissingContactField(contactRef.current);
      if (nextContact) pushModel(getQuestionForContactField(nextContact));
    }
  };

  const orchestrateContact = (aiJson: any) => {
    console.count('orchestrateContact');
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
    else pushModel('Thanks. Our office will reach out shortly to confirm the details.');
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

  // IMPORTANT: The local, Gemini-independent flow below is intentional and must NOT be removed.
const processMessage = async (text: string) => {
  console.count('processMessage');
  const cleanText = text.trim();
  if (!cleanText) return;

  if (isProcessingRef.current) return;
  isProcessingRef.current = true;

  setMessages(prev => [...prev, { role: 'user', text: cleanText }]);
  setInput('');
  setIsLoading(true);

  try {
    let aiJson: any = {};

    const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY || '';
    if (!apiKey) {
      console.error('Missing VITE_API_KEY (or API_KEY). Gemini is disabled in the browser build.');
      aiJson = {};
    } else {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are an intake interpreter. You must ONLY return valid JSON (no prose, no questions, no markdown) matching this schema and using snake_case keys. Use null for unknown.

Schema:
{
  "business_name": string | null,
  "address_line": string | null,
  "city": string | null,
  "state": string | null,
  "zip": string | null,
  "system_type": string | null,
  "gallons": string | null,
  "parking_distance": string | null,
  "contact_name": string | null,
  "contact_phone": string | null,
  "contact_email": string | null
}`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: cleanText }] }],
        config: { systemInstruction: systemPrompt },
      });

      const raw = extractTextFromGeminiResponse(resp);
      const aiText = stripFencedJson(raw || '');

      try {
        aiJson = aiText ? JSON.parse(aiText) : {};
      } catch (err) {
        console.error('AI JSON parse failed:', err, aiText);
        aiJson = {};
      }

      // Deterministic fallback: if AI omitted the *expected* next field, use the user's raw input for that field.
      const expectedField = getFirstMissingField(intakeRef.current);
      const expectedContactField = getFirstMissingContactField(contactRef.current);
      const intakeIncomplete = !!expectedField;

      if (intakeIncomplete && expectedField && !isNonEmptyValue(aiJson?.[expectedField])) {
        aiJson[expectedField] = cleanText;
      } else if (!intakeIncomplete && expectedContactField && !isNonEmptyValue(aiJson?.[expectedContactField])) {
        aiJson[expectedContactField] = cleanText;
      }
    }

    const nextField = getFirstMissingField(intakeRef.current);
    if (nextField) orchestrateIntake(aiJson);
    else orchestrateContact(aiJson);
  } catch (err) {
    console.error('AI call failed:', err);
    const nextField = getFirstMissingField(intakeRef.current);
    if (nextField) orchestrateIntake({});
    else orchestrateContact({});
  } finally {
    setIsLoading(false);
    isProcessingRef.current = false;
  }
};
// On mount, if no messages, ask for the first missing field (once)
useEffect(() => {
  if (didInitRef.current) return;
  didInitRef.current = true;

  const firstField = getFirstMissingField(intakeRef.current);
  if (firstField) pushModel(getQuestionForField(firstField));
}, []);

  return (
    <>
      {!isLoading && getSuggestions().length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 bg-white/80 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2">
          {getSuggestions().map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => processMessage(chip)}
              className="inline-block px-5 py-2.5 bg-white hover:bg-slate-950 hover:text-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 transition-all active:scale-95 shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
      <form
        className="p-6 border-t border-slate-100 bg-white"
        onSubmit={e => {
          e.preventDefault();
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
                window.location.reload();
              }
            }}
            className="w-12 h-12 rounded-xl text-slate-300 hover:text-red-500 transition-all flex items-center justify-center"
            disabled={isLoading}
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
            className="bg-slate-950 text-white w-14 h-14 rounded-xl flex items-center justify-center shadow-xl hover:bg-black transition-all"
          >
            <i className="fas fa-paper-plane text-amber-500" aria-label="Send"></i>
          </button>
        </div>
      </form>
    </>
  );
};


