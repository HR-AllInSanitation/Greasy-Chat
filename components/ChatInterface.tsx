import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from '@google/genai';
import React, { useState, useEffect, useRef } from 'react';
import { calculateServiceEstimate } from '../services/pricingEngine';
import { EstimationInputs, EstimationResult, Frequency, LeadInfo, ServiceType } from '../types';

const generateQuoteId = () => `QT-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

type ConversationStep =
  | 'ASK_BUSINESS_NAME_ADDRESS'
  | 'ASK_SYSTEM_TYPE'
  | 'ASK_GALLONS'
  | 'ASK_PARKING_DISTANCE'
  | 'ASK_CONTACT_INFO'
  | 'CONFIRM_QUOTE'
  | 'SHOW_QUOTE'
  | 'COMPLETE'
  | 'NONE';

interface Message {
  role: 'user' | 'model';
  text: string;
  estimate?: EstimationResult;
  quoteId?: string;
}

const setConversationStepTool: FunctionDeclaration = {
  name: 'setConversationStep',
  parameters: {
    type: Type.OBJECT,
    description: 'Update the current step of the intake process to show relevant suggestion chips.',
    properties: {
      step: { 
        type: Type.STRING, 
        enum: ['ASK_BUSINESS_NAME_ADDRESS', 'ASK_SYSTEM_TYPE', 'ASK_GALLONS', 'ASK_PARKING_DISTANCE', 'COMPLETE']
      }
    },
    required: ['step']
  }
};

export const ChatInterface: React.FC = () => {
  const hasApiKey = !!process.env.API_KEY;
  
  const [messages, setMessages] = useState<Message[]>(() => {
    // If no API key is present, start silently with the normal welcome prompt and allow the local flow to proceed.
    try {
      const saved = sessionStorage.getItem('ais_chat_history');
      if (saved) return JSON.parse(saved);
      return [
        { role: 'model', text: "Welcome to dispatch. I'm your Greasy Agent.\n\nWhat's your business name and address?" }
      ];
    } catch { return []; }
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentLead, setCurrentLead] = useState<LeadInfo & { quoteId?: string }>(() => ({
    name: 'Guest',
    phone: '',
    email: '',
    address: '',
    restaurantName: '', 
    parkingDistance: 0,
    needsRestroom: false,
    needsUCORecycling: false,
    additionalComments: '',
    lastServiceDate: '',
  }));
  const [currentEstimate, setCurrentEstimate] = useState<EstimationResult | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [conversationStep, setConversationStep] = useState<ConversationStep>('ASK_BUSINESS_NAME_ADDRESS');
  
  const [confirmedFields, setConfirmedFields] = useState({
    name: false,
    address: false,
    systemType: false,
    gallons: false,
    distance: false
  });

  const [collectedInputs, setCollectedInputs] = useState<EstimationInputs>({
    serviceType: ServiceType.GREASE_TRAP,
    tierKey: 'Standard',
    frequency: Frequency.ONCE,
    isOpeningSoon: false,
    parkingDistance: 0,
    gallons: 0,
    location: { latitude: 34.0522, longitude: -118.2437, address: '' }
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  const inFlightRef = useRef(false);

  const getSuggestions = () => {
    // Suggestions are shown ONLY for the parking distance step per spec.
    if (conversationStep === 'ASK_PARKING_DISTANCE') {
      return ['50','100','150','200','Unsure'];
    }
    return [];
  };

  useEffect(() => {
    const handleTrigger = (event: any) => {
      const { message, focusOnly } = event.detail;
      if (focusOnly) inputRef.current?.focus();
      else if (message) processMessage(message);
    };
    window.addEventListener('ais-trigger-chat', handleTrigger);
    return () => window.removeEventListener('ais-trigger-chat', handleTrigger);
  }, [messages, isLoading, conversationStep, collectedInputs, confirmedFields, currentLead]);

  useEffect(() => {
    sessionStorage.setItem('ais_chat_history', JSON.stringify(messages));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }, [messages]);

  // IMPORTANT: The local, Gemini-independent flow below is intentional and must NOT be removed.
  const processMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isProcessingRef.current) { return; }
    isProcessingRef.current = true;

    try {
      let updatedInputs = { ...collectedInputs };
      let updatedFields = { ...confirmedFields };
      let updatedLead = { ...currentLead };
      let updatedStep = conversationStep;
      
      const userMessage: Message = { role: 'user', text: cleanText };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

    // If there's no Gemini API key, handle known steps locally (do NOT call Gemini)
    if (!hasApiKey) {
      // Detect if user sent contact info early (email or phone) and handle it immediately
      const _emailEarly = cleanText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      const _phoneEarly = cleanText.match(/(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (_emailEarly || _phoneEarly) {
        if (_emailEarly) updatedLead.email = _emailEarly[0];
        if (_phoneEarly) updatedLead.phone = _phoneEarly[0];
        if (!updatedFields.name) {
          const nameCandidate = cleanText.replace(_emailEarly ? _emailEarly[0] : '', '').replace(_phoneEarly ? _phoneEarly[0] : '', '').trim();
          if (nameCandidate) { updatedLead.name = nameCandidate; updatedFields.name = true; }
        }
        setCurrentLead(updatedLead);
        setConfirmedFields(updatedFields);
        if (updatedLead.name && (updatedLead.email || updatedLead.phone)) {
          setConversationStep('CONFIRM_QUOTE');
          setMessages(prev => [...prev, { role: 'model', text: "Do you confirm this quote? Reply 'yes' to confirm." }]);
        } else {
          setMessages(prev => [...prev, { role: 'model', text: "Please provide your name, email, and phone number." }]);
        }
        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }

      // Business name + address parsing (local-only)
      if (conversationStep === 'ASK_BUSINESS_NAME_ADDRESS') {
        const streetTokens = "st|street|rd|road|ave|avenue|blvd|boulevard|pkwy|parkway|dr|drive|ln|lane|way|ct|court|pl|place|ter|terrace|cir|circle";
        const patternA = new RegExp(`\\b\\d+[^\\n,]*\\b(${streetTokens})\\b`, "i");
        const patternB = /,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?/i; // ", CA 91354" or ", NY 10001-1234"

        const parseNameAndAddress = (t: string) => {
          const aMatch = t.match(patternA);
          if (aMatch) {
            const addrStart = t.toLowerCase().indexOf(aMatch[0].toLowerCase());
            const address = t.slice(addrStart).trim();
            const name = t.slice(0, addrStart).trim().replace(/,$/, '');
            if (name) return { name, address };
            return { address };
          }
          const bMatch = t.match(patternB);
          if (bMatch) {
            const idx = t.search(patternB);
            // attempt to include a reasonable window before the match as the street portion
            const preceding = t.slice(0, idx);
            const lastComma = preceding.lastIndexOf(',');
            const start = lastComma !== -1 ? lastComma + 1 : Math.max(0, idx - 60);
            const address = t.slice(start).trim();
            const name = t.replace(address, '').replace(/,$/, '').trim();
            if (name) return { name, address };
            return { address };
          }
          return {};
        };

        const parsed = parseNameAndAddress(cleanText);
        if (parsed.address && parsed.name) {
          updatedLead.address = parsed.address;
          updatedLead.restaurantName = parsed.name;
          updatedFields.address = true;
          updatedFields.name = true;
          updatedStep = 'ASK_SYSTEM_TYPE';
          setCollectedInputs(updatedInputs);
          setCurrentLead(updatedLead);
          setConfirmedFields(updatedFields);
          setConversationStep(updatedStep);
          setMessages(prev => [...prev, { role: 'model', text: "What is the system type?" }]);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        } else if (parsed.address) {
          updatedLead.address = parsed.address;
          updatedFields.address = true;
          // Address-only → ask for business name (exact phrasing)
          setMessages(prev => [...prev, { role: 'model', text: "Thanks — what’s the business name?" }]);
          setConfirmedFields(updatedFields);
          setCurrentLead(updatedLead);
          setConversationStep(updatedStep); // stay on ASK_BUSINESS_NAME_ADDRESS
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        } else if (parsed.name) {
          updatedLead.restaurantName = parsed.name;
          updatedFields.name = true;
          // Name-only → ask for address (exact phrasing)
          setMessages(prev => [...prev, { role: 'model', text: "Got it — what’s the address?" }]);
          setConfirmedFields(updatedFields);
          setCurrentLead(updatedLead);
          setConversationStep(updatedStep);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        } else {
          // Parsing failed → ask for both (exact phrasing)
          setMessages(prev => [...prev, { role: 'model', text: "What’s your business name and address?" }]);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        }
      }

      // System type -> advance to gallons
      if (conversationStep === 'ASK_SYSTEM_TYPE') {
        if (/indoor|inside|trap|trampa/i.test(cleanText)) updatedInputs.serviceType = ServiceType.GREASE_TRAP;
        if (/outdoor|outside|interceptor/i.test(cleanText)) updatedInputs.serviceType = ServiceType.INTERCEPTOR;
        if (/clarifier|clarificador/i.test(cleanText)) updatedInputs.serviceType = ServiceType.CLARIFIER;
        if (/jet|hydro|drain/i.test(cleanText)) updatedInputs.serviceType = ServiceType.HYDRO_JET;
        updatedFields.systemType = true;
        updatedStep = 'ASK_GALLONS';
        setCollectedInputs(updatedInputs);
        setConfirmedFields(updatedFields);
        setConversationStep(updatedStep);
        setMessages(prev => [...prev, { role: 'model', text: "How many gallons?" }]);
        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }

      // Gallons -> advance to parking distance
      if (conversationStep === 'ASK_GALLONS') {
        if (/unsure|no se|no estoy seguro/i.test(cleanText)) {
          updatedInputs.gallons = 0; 
        } else if (/\d+/.test(cleanText)) {
          updatedInputs.gallons = parseInt(cleanText.match(/\d+/)![0]);
        }
        updatedFields.gallons = true;
        updatedStep = 'ASK_PARKING_DISTANCE';
        setCollectedInputs(updatedInputs);
        setConfirmedFields(updatedFields);
        setConversationStep(updatedStep);
        setMessages(prev => [...prev, { role: 'model', text: "What’s the parking distance?" }]);
        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }

      // Parking distance -> complete and show quote
      if (conversationStep === 'ASK_PARKING_DISTANCE') {
        if (/\d+/.test(cleanText)) {
          updatedInputs.parkingDistance = parseInt(cleanText.match(/\d+/)![0]);
        } else if (/unsure|no se/i.test(cleanText)) {
          updatedInputs.parkingDistance = 150; 
        }
        updatedFields.distance = true;
        updatedStep = 'ASK_CONTACT_INFO';
        setCollectedInputs(updatedInputs);
        setConfirmedFields(updatedFields);

        // proceed to collect contact info before showing quote
        setConversationStep('ASK_CONTACT_INFO');
        setMessages(prev => [...prev, { role: 'model', text: "Thanks — next, what's your contact name and phone?" }]);

        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }

      // Contact info (name/email/phone) -> confirm quote
      if (conversationStep === 'ASK_CONTACT_INFO') {
        const emailMatch = cleanText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        const phoneMatch = cleanText.match(/(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (emailMatch) updatedLead.email = emailMatch[0];
        if (phoneMatch) updatedLead.phone = phoneMatch[0];
        if (!updatedFields.name && !emailMatch && !phoneMatch) {
          updatedLead.name = cleanText;
          updatedFields.name = true;
        }
        setCurrentLead(updatedLead);
        setConfirmedFields(updatedFields);

        if (updatedLead.name && (updatedLead.email || updatedLead.phone)) {
          setConversationStep('CONFIRM_QUOTE');
          setMessages(prev => [...prev, { role: 'model', text: "Do you confirm this quote? Reply 'yes' to confirm." }]);
        } else {
          setMessages(prev => [...prev, { role: 'model', text: "Please provide your name, email, and phone number." }]);
        }

        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }
    }

    // If we're at the confirmation step, handle locally (no Gemini) per spec.
    if (conversationStep === 'CONFIRM_QUOTE') {
      const confirmed = /^(yes|y|si|sure|confirm|confirmar|sí|ok)$/i.test(cleanText.trim());
      if (confirmed) {
        // If any required inputs are missing, ask for them instead of proceeding.
        if (!confirmedFields.name || !confirmedFields.address || !confirmedFields.systemType || !confirmedFields.gallons || !confirmedFields.distance) {
          if (!confirmedFields.name || !confirmedFields.address) {
            setMessages(prev => [...prev, { role: 'model', text: "What’s your business name and address?" }]);
          } else if (!confirmedFields.systemType) {
            setMessages(prev => [...prev, { role: 'model', text: "What is the system type?" }]);
          } else if (!confirmedFields.gallons) {
            setMessages(prev => [...prev, { role: 'model', text: "How many gallons?" }]);
          } else if (!confirmedFields.distance) {
            setMessages(prev => [...prev, { role: 'model', text: "What’s the parking distance?" }]);
          }
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        }

        const finalEst = calculateServiceEstimate(collectedInputs);
        setCurrentEstimate(finalEst);
        setConversationStep('SHOW_QUOTE');
        setMessages(prev => [...prev, { role: 'model', text: "Here is your estimate.", estimate: finalEst }]);
        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }
    }

    try {
      if (conversationStep === 'ASK_BUSINESS_NAME_ADDRESS') {
        const streetTokens = "st|street|rd|road|ave|avenue|blvd|boulevard|pkwy|parkway|dr|drive|ln|lane|way|ct|court|pl|place|ter|terrace|cir|circle";
        const patternA = new RegExp(`\\b\\d+[^\\n,]*\\b(${streetTokens})\\b`, "i");
        const patternB = /,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?/i; // ", CA 91354" or ", NY 10001-1234"

        const parseNameAndAddress = (t: string) => {
          const aMatch = t.match(patternA);
          if (aMatch) {
            const addrStart = t.toLowerCase().indexOf(aMatch[0].toLowerCase());
            const address = t.slice(addrStart).trim();
            const name = t.slice(0, addrStart).trim().replace(/,$/, '');
            if (name) return { name, address };
            return { address };
          }
          const bMatch = t.match(patternB);
          if (bMatch) {
            const idx = t.search(patternB);
            // attempt to include a reasonable window before the match as the street portion
            const preceding = t.slice(0, idx);
            const lastComma = preceding.lastIndexOf(',');
            const start = lastComma !== -1 ? lastComma + 1 : Math.max(0, idx - 60);
            const address = t.slice(start).trim();
            const name = t.replace(address, '').replace(/,$/, '').trim();
            if (name) return { name, address };
            return { address };
          }
          return {};
        };

        const parsed = parseNameAndAddress(cleanText);
        if (parsed.address && parsed.name) {
          updatedLead.address = parsed.address;
          updatedLead.restaurantName = parsed.name;
          updatedFields.address = true;
          updatedFields.name = true;
          updatedStep = 'ASK_SYSTEM_TYPE';
        } else if (parsed.address) {
          updatedLead.address = parsed.address;
          updatedFields.address = true;
          // Address-only → ask for business name (exact phrasing)
          setMessages(prev => [...prev, { role: 'model', text: "Thanks — what’s the business name?" }]);
          setConfirmedFields(updatedFields);
          setCurrentLead(updatedLead);
          setConversationStep(updatedStep); // stay on ASK_BUSINESS_NAME_ADDRESS
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        } else if (parsed.name) {
          updatedLead.restaurantName = parsed.name;
          updatedFields.name = true;
          // Name-only → ask for address (exact phrasing)
          setMessages(prev => [...prev, { role: 'model', text: "Got it — what’s the address?" }]);
          setConfirmedFields(updatedFields);
          setCurrentLead(updatedLead);
          setConversationStep(updatedStep);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        } else {
          // Parsing failed → ask for both (exact phrasing)
          setMessages(prev => [...prev, { role: 'model', text: "What’s your business name and address?" }]);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        }
      }

      if (inFlightRef.current) {
        // Prevent duplicate Gemini calls while one is in-flight.
        setIsLoading(false);
        isProcessingRef.current = false;
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contents = [...messages, userMessage].slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      inFlightRef.current = true;
      let response: any;
      try {
        const aiPromise = ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents,
          config: {
            systemInstruction: `You are "The Greasy Agent", dispatcher for LA Restaurant Services.
TONE: Professional dispatcher.
BILINGUAL: Respond in the language the user uses (English or Spanish).
CONSTRAINTS: 1-2 sentences. Ask only ONE question.
UNSURE: If user says "Unsure", accept it and move forward.
FLOW: System Type -> Capacity -> Hose Distance. Use setConversationStep tool.`,
            tools: [{ functionDeclarations: [setConversationStepTool] }],
          }
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject({ code: 'timeout' }), 12000));
        response = await Promise.race([aiPromise, timeoutPromise]);
      } finally {
        inFlightRef.current = false;
      }

      if (response && response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'setConversationStep') {
            updatedStep = (call.args as any).step as ConversationStep;
            setConversationStep(updatedStep);
          }
        }
      }

      const responseText = response?.text || "Understood.";
      
      if (updatedStep === 'ASK_GALLONS') {
        if (/indoor|inside|trap|trampa/i.test(cleanText)) updatedInputs.serviceType = ServiceType.GREASE_TRAP;
        if (/outdoor|outside|interceptor/i.test(cleanText)) updatedInputs.serviceType = ServiceType.INTERCEPTOR;
        if (/clarifier|clarificador/i.test(cleanText)) updatedInputs.serviceType = ServiceType.CLARIFIER;
        if (/jet|hydro|drain/i.test(cleanText)) updatedInputs.serviceType = ServiceType.HYDRO_JET;
        updatedFields.systemType = true;
      }
      
      if (updatedStep === 'ASK_PARKING_DISTANCE') {
        if (/unsure|no se|no estoy seguro/i.test(cleanText)) {
          updatedInputs.gallons = 0; 
        } else if (/\d+/.test(cleanText)) {
          updatedInputs.gallons = parseInt(cleanText.match(/\d+/)![0]);
        }
        updatedFields.gallons = true;
      }

      if (updatedStep === 'COMPLETE') {
        if (/\d+/.test(cleanText)) {
          updatedInputs.parkingDistance = parseInt(cleanText.match(/\d+/)![0]);
        } else if (/unsure|no se/i.test(cleanText)) {
          updatedInputs.parkingDistance = 150; 
        }
        updatedFields.distance = true;
      }

      setCollectedInputs(updatedInputs);
      setCurrentLead(updatedLead);
      setConfirmedFields(updatedFields);
      
      if (updatedStep === 'COMPLETE' && updatedFields.name && updatedFields.address) {
          const finalEst = calculateServiceEstimate(updatedInputs);
          setCurrentEstimate(finalEst);
          setConversationStep('SHOW_QUOTE');
          const completionText = cleanText.toLowerCase().includes('hola') || cleanText.toLowerCase().includes('buenos') || /es|español/i.test(responseText)
            ? "Ruta optimizada. Aquí tienes tu presupuesto basado en el despacho de Sylmar."
            : "Operational range optimized. Here is your estimate based on Sylmar dispatch.";
          setMessages(prev => [...prev, { role: 'model', text: completionText, estimate: finalEst }]);
      } else {
          setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }

    } catch (e: any) {
      const status = e?.status || e?.statusCode || e?.response?.status || e?.code;
      if (status === 401 || status === 403) {
        // Fallback: treat as if there's no API key and run local handlers so UI doesn't get stuck.
        // Business name + address parsing
        if (conversationStep === 'ASK_BUSINESS_NAME_ADDRESS') {
          const streetTokens = "st|street|rd|road|ave|avenue|blvd|boulevard|pkwy|parkway|dr|drive|ln|lane|way|ct|court|pl|place|ter|terrace|cir|circle";
          const patternA = new RegExp(`\\b\\d+[^\\n,]*\\b(${streetTokens})\\b`, "i");
          const patternB = /,\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?/i;

          const parseNameAndAddress = (t: string) => {
            const aMatch = t.match(patternA);
            if (aMatch) {
              const addrStart = t.toLowerCase().indexOf(aMatch[0].toLowerCase());
              const address = t.slice(addrStart).trim();
              const name = t.slice(0, addrStart).trim().replace(/,$/, '');
              if (name) return { name, address };
              return { address };
            }
            const bMatch = t.match(patternB);
            if (bMatch) {
              const idx = t.search(patternB);
              const preceding = t.slice(0, idx);
              const lastComma = preceding.lastIndexOf(',');
              const start = lastComma !== -1 ? lastComma + 1 : Math.max(0, idx - 60);
              const address = t.slice(start).trim();
              const name = t.replace(address, '').replace(/,$/, '').trim();
              if (name) return { name, address };
              return { address };
            }
            return {};
          };

          const parsed = parseNameAndAddress(cleanText);
          if (parsed.address && parsed.name) {
            updatedLead.address = parsed.address;
            updatedLead.restaurantName = parsed.name;
            updatedFields.address = true;
            updatedFields.name = true;
            updatedStep = 'ASK_SYSTEM_TYPE';
            setCollectedInputs(updatedInputs);
            setCurrentLead(updatedLead);
            setConfirmedFields(updatedFields);
            setConversationStep(updatedStep);
            setMessages(prev => [...prev, { role: 'model', text: "What is the system type?" }]);
            setIsLoading(false);
            isProcessingRef.current = false;
            return;
          } else if (parsed.address) {
            updatedLead.address = parsed.address;
            updatedFields.address = true;
            setMessages(prev => [...prev, { role: 'model', text: "Thanks — what’s the business name?" }]);
            setConfirmedFields(updatedFields);
            setCurrentLead(updatedLead);
            setConversationStep(updatedStep);
            setIsLoading(false);
            isProcessingRef.current = false;
            return;
          } else if (parsed.name) {
            updatedLead.restaurantName = parsed.name;
            updatedFields.name = true;
            setMessages(prev => [...prev, { role: 'model', text: "Got it — what’s the address?" }]);
            setConfirmedFields(updatedFields);
            setCurrentLead(updatedLead);
            setConversationStep(updatedStep);
            setIsLoading(false);
            isProcessingRef.current = false;
            return;
          } else {
            setMessages(prev => [...prev, { role: 'model', text: "What’s your business name and address?" }]);
            setIsLoading(false);
            isProcessingRef.current = false;
            return;
          }
        }

        // System type
        if (conversationStep === 'ASK_SYSTEM_TYPE') {
          if (/indoor|inside|trap|trampa/i.test(cleanText)) updatedInputs.serviceType = ServiceType.GREASE_TRAP;
          if (/outdoor|outside|interceptor/i.test(cleanText)) updatedInputs.serviceType = ServiceType.INTERCEPTOR;
          if (/clarifier|clarificador/i.test(cleanText)) updatedInputs.serviceType = ServiceType.CLARIFIER;
          if (/jet|hydro|drain/i.test(cleanText)) updatedInputs.serviceType = ServiceType.HYDRO_JET;
          updatedFields.systemType = true;
          updatedStep = 'ASK_GALLONS';
          setCollectedInputs(updatedInputs);
          setConfirmedFields(updatedFields);
          setConversationStep(updatedStep);
          setMessages(prev => [...prev, { role: 'model', text: "How many gallons?" }]);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        }

        // Gallons
        if (conversationStep === 'ASK_GALLONS') {
          if (/unsure|no se|no estoy seguro/i.test(cleanText)) {
            updatedInputs.gallons = 0;
          } else if (/\d+/.test(cleanText)) {
            updatedInputs.gallons = parseInt(cleanText.match(/\d+/)![0]);
          }
          updatedFields.gallons = true;
          updatedStep = 'ASK_PARKING_DISTANCE';
          setCollectedInputs(updatedInputs);
          setConfirmedFields(updatedFields);
          setConversationStep(updatedStep);
          setMessages(prev => [...prev, { role: 'model', text: "What’s the parking distance?" }]);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        }

        // Parking distance
        if (conversationStep === 'ASK_PARKING_DISTANCE') {
          if (/\d+/.test(cleanText)) {
            updatedInputs.parkingDistance = parseInt(cleanText.match(/\d+/)![0]);
          } else if (/unsure|no se/i.test(cleanText)) {
            updatedInputs.parkingDistance = 150;
          }
          updatedFields.distance = true;
          updatedStep = 'ASK_CONTACT_INFO';
          setCollectedInputs(updatedInputs);
          setConfirmedFields(updatedFields);

          // proceed to collect contact info before showing quote
          setConversationStep('ASK_CONTACT_INFO');
          setMessages(prev => [...prev, { role: 'model', text: "Thanks — next, what's your contact name and phone?" }]);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        }

        // Contact info
        if (conversationStep === 'ASK_CONTACT_INFO') {
          const emailMatch = cleanText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
          const phoneMatch = cleanText.match(/(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}/);
          if (emailMatch) updatedLead.email = emailMatch[0];
          if (phoneMatch) updatedLead.phone = phoneMatch[0];
          if (!updatedFields.name && !emailMatch && !phoneMatch) {
            updatedLead.name = cleanText;
            updatedFields.name = true;
          }
          setCurrentLead(updatedLead);
          setConfirmedFields(updatedFields);

          if (updatedLead.name && (updatedLead.email || updatedLead.phone)) {
            setConversationStep('CONFIRM_QUOTE');
            setMessages(prev => [...prev, { role: 'model', text: "Do you confirm this quote? Reply 'yes' to confirm." }]);
            setIsLoading(false);
            isProcessingRef.current = false;
            return;
          } else {
            setMessages(prev => [...prev, { role: 'model', text: "Please provide your name, email, and phone number." }]);
            setIsLoading(false);
            isProcessingRef.current = false;
            return;
          }
        }

        // If none of the local fallback branches above matched, inform the user that the chat key is not authorized.
        setMessages(prev => [...prev, { role: 'model', text: "Chat key not authorized. Please request a manual quote." }]);

      } else if (status === 429) {
        setMessages(prev => [...prev, { role: 'model', text: "Chat is busy. Try again in 30 seconds." }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "Chat temporarily unavailable. Please request a manual quote." }]);
      }
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  } finally {
    // Ensure we always clear UI loading state even if an unexpected early return occurs inside the try block.
    setIsLoading(false);
    isProcessingRef.current = false;
  }
  };

  return (
    <>
      <div className={`flex flex-col h-[580px] border border-slate-200 rounded-b-[3rem] bg-white shadow-2xl overflow-hidden relative`}>
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFF]/50 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[90%] ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-[1.5rem] rounded-tr-none px-5 py-4 shadow-lg' : 'bg-white border border-slate-100 text-slate-900 rounded-[1.5rem] rounded-tl-none shadow-sm px-5 py-4 border-l-4 border-l-amber-500'}`}>
                <p className="text-[13px] font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.estimate && (
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                    <div className="text-4xl font-black text-slate-950 tracking-tighter">${msg.estimate.minPrice} - ${msg.estimate.maxPrice}</div>
                    <button onClick={() => setShowQuoteModal(true)} className="w-full bg-slate-950 text-white text-[10px] font-black py-4 rounded-xl uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 group">
                       View Audit Breakdown <i className="fas fa-arrow-right text-amber-500 group-hover:translate-x-1 transition-transform"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-start p-4 bg-white/50 rounded-2xl animate-pulse">
               <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce mx-0.5"></div>
               <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce mx-0.5 [animation-delay:0.2s]"></div>
               <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce mx-0.5 [animation-delay:0.4s]"></div>
            </div>
          )}
        </div>
        
        {!isLoading && getSuggestions().length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-white/80 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2">
            {getSuggestions().map((chip, idx) => (
              <button key={idx} onClick={() => processMessage(chip)} className="inline-block px-5 py-2.5 bg-white hover:bg-slate-950 hover:text-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 transition-all active:scale-95 shadow-sm">
                {chip}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="flex gap-3">
            <button onClick={() => { if (window.confirm("Reset?")) { sessionStorage.removeItem('ais_chat_history'); window.location.reload(); } }} className="w-12 h-12 rounded-xl text-slate-300 hover:text-red-500 transition-all flex items-center justify-center" disabled={isLoading}>
              <i className="fas fa-rotate-left"></i>
            </button>
            <div className="flex-1 relative">
<input
  ref={inputRef}
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && processMessage((e.target as HTMLInputElement).value)}
  placeholder={"Instructions..."}
  className="w-full bg-slate-50 border-2 border-slate-50 focus:border-amber-500 focus:bg-white rounded-xl px-6 py-3.5 text-[14px] font-bold outline-none transition-all shadow-inner"
  disabled={isLoading}
/>
            </div>
            <button onClick={() => processMessage(inputRef.current?.value || '')} disabled={isLoading || !(inputRef.current?.value?.trim() || input.trim())} className="bg-slate-950 text-white w-14 h-14 rounded-xl flex items-center justify-center shadow-xl hover:bg-black transition-all">
              <i className="fas fa-paper-plane text-amber-500"></i>
            </button>
          </div>
        </div>
      </div>

      {showQuoteModal && currentEstimate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-6 no-print" onClick={() => setShowQuoteModal(false)}>
          <div className="bg-white w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[4rem] p-12 shadow-3xl relative animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter">Operational Breakdown</h2>
              <button onClick={() => setShowQuoteModal(false)} className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {currentEstimate.requiresVerification && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-8 mb-12 rounded-r-[2rem] flex items-start gap-6">
                <i className="fas fa-triangle-exclamation text-amber-500 text-3xl mt-1"></i>
                <div>
                  <h4 className="text-[12px] font-black text-amber-900 uppercase tracking-[0.2em] mb-2">Technical Audit Required</h4>
                  <p className="text-sm font-bold text-amber-800 leading-relaxed">
                    Quote based on 1600gal safety default. Site verification required for final capacity audit.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Location</h4>
                  <div className="text-3xl font-black text-slate-950">{currentLead.restaurantName}</div>
                  <p className="text-sm font-bold text-slate-500 mt-2">{currentLead.address}</p>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Matrix Audit Data</h4>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">milesFromHQ</div>
                      <div className="text-xl font-black text-slate-950">{currentEstimate.breakdown.milesFromHQ} mi</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">thresholdMi</div>
                      <div className="text-xl font-black text-slate-950">{currentEstimate.breakdown.thresholdMi} mi</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">surchargePerMi</div>
                      <div className="text-xl font-black text-slate-950">${currentEstimate.breakdown.surchargePerMi.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">distanceFee</div>
                      <div className="text-xl font-black text-emerald-600">+${currentEstimate.breakdown.distanceFee}</div>
                    </div>
                  </div>
                </div>

                {!bookingConfirmed ? (
                  <button onClick={() => setBookingConfirmed(true)} className="w-full bg-slate-950 text-amber-500 font-black py-6 rounded-3xl uppercase text-[12px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all hover:bg-black">Request Site Verification</button>
                ) : (
                  <div className="p-12 bg-emerald-50 rounded-[3rem] border border-emerald-100 text-center">
                    <div className="text-2xl font-black text-emerald-950 uppercase tracking-widest">Lead Dispatched</div>
                    <p className="text-sm text-emerald-700 font-bold mt-2">Sylmar HQ will contact you shortly.</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-950 text-white p-12 rounded-[4rem] min-h-[450px] flex flex-col justify-between shadow-3xl">
                <div>
                  <div className="text-7xl font-black tracking-tighter mb-4">${currentEstimate.minPrice} - ${currentEstimate.maxPrice}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Service Range</div>
                </div>
                
                <div className="space-y-4 pt-12 border-t border-white/10">
                  <div className="bg-white/5 p-6 rounded-2xl">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Subtotal (1.0x)</div>
                    <div className="text-2xl font-black text-amber-400">${currentEstimate.breakdown.subtotalBeforeBuffer}</div>
                  </div>
                  
                  {currentEstimate.notes.map((note, idx) => (
                    <div key={idx} className="flex gap-3 text-xs font-bold text-slate-300">
                      <i className="fas fa-info-circle text-amber-500 mt-0.5"></i>
                      <span>{note}</span>
                    </div>
                  ))}
                  <button onClick={() => window.print()} className="w-full mt-4 bg-white/5 py-4 rounded-2xl text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] border border-white/5 transition-all hover:bg-white/10">
                    <i className="fas fa-print mr-2"></i> Print Estimate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};