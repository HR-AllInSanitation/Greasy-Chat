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
    if (!hasApiKey) return [{ role: 'model', text: "Chat key not authorized. Please request a manual quote." }];
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

  const getSuggestions = () => {
    if (conversationStep === 'ASK_SYSTEM_TYPE') {
      return ['Indoor Trap', 'Outdoor Interceptor', 'Clarifier', 'Hydro Jetting'];
    }
    if (conversationStep === 'ASK_GALLONS') {
      if (collectedInputs.serviceType === ServiceType.GREASE_TRAP) return ['25', '50', '75', 'Unsure'];
      return ['750', '1600', '2500', 'Unsure'];
    }
    if (conversationStep === 'ASK_PARKING_DISTANCE') {
      return ['50', '100', '150', '200', 'Unsure'];
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

  const processMessage = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isProcessingRef.current || !hasApiKey) return;
    isProcessingRef.current = true;
    
    let updatedInputs = { ...collectedInputs };
    let updatedFields = { ...confirmedFields };
    let updatedLead = { ...currentLead };
    let updatedStep = conversationStep;
    
    const userMessage: Message = { role: 'user', text: cleanText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (conversationStep === 'ASK_BUSINESS_NAME_ADDRESS') {
        const looksLikeAddress = (t: string): boolean => {
          const streetTokens = "st|street|rd|road|ave|avenue|blvd|boulevard|pkwy|parkway|dr|drive|ln|lane|way|ct|court|pl|place|ter|terrace|cir|circle";
          const patternA = new RegExp(`^\\s*\\d+.*\\b(${streetTokens})\\b`, "i");
          return patternA.test(t);
        };

        const inputIsAddress = looksLikeAddress(cleanText);
        if (inputIsAddress) {
          updatedLead.address = cleanText;
          updatedFields.address = true;
        } else {
          updatedLead.restaurantName = cleanText;
          updatedFields.name = true;
        }

        if (updatedFields.name && updatedFields.address) {
          updatedStep = 'ASK_SYSTEM_TYPE';
        } else {
          const nextPrompt = updatedFields.name ? "What is the service address?" : "What is the business name?";
          setMessages(prev => [...prev, { role: 'model', text: nextPrompt }]);
          setConfirmedFields(updatedFields);
          setCurrentLead(updatedLead);
          setConversationStep(updatedStep);
          setIsLoading(false);
          isProcessingRef.current = false;
          return;
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contents = [...messages, userMessage].slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
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

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'setConversationStep') {
            updatedStep = (call.args as any).step as ConversationStep;
            setConversationStep(updatedStep);
          }
        }
      }

      const responseText = response.text || "Understood.";
      
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
          setConversationStep('NONE');
          const completionText = cleanText.toLowerCase().includes('hola') || cleanText.toLowerCase().includes('buenos') || /es|español/i.test(responseText)
            ? "Ruta optimizada. Aquí tienes tu presupuesto basado en el despacho de Sylmar."
            : "Operational range optimized. Here is your estimate based on Sylmar dispatch.";
          setMessages(prev => [...prev, { role: 'model', text: completionText, estimate: finalEst }]);
      } else {
          setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }

    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'model', text: "Dispatch busy. Call 818.698.4252." }]);
    } finally {
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
              <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && processMessage(input)} placeholder={hasApiKey ? "Instructions..." : "Offline"} className="w-full bg-slate-50 border-2 border-slate-50 focus:border-amber-500 focus:bg-white rounded-xl px-6 py-3.5 text-[14px] font-bold outline-none transition-all shadow-inner" disabled={isLoading} />
            </div>
            <button onClick={() => processMessage(input)} disabled={isLoading || !input.trim()} className="bg-slate-950 text-white w-14 h-14 rounded-xl flex items-center justify-center shadow-xl hover:bg-black transition-all">
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