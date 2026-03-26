import React, { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
  ctaMessage?: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
  className?: string;
  onCTAClick?: (message: string) => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ 
  title = "Frequently Asked Questions", 
  faqs,
  className = "",
  onCTAClick
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Play sci-fi blip sound
  const playSound = () => {
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
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch (err) {}
  };

  const handleCTAClick = (e: React.MouseEvent, ctaMessage?: string) => {
    e.preventDefault();
    playSound();
    
    // Scroll to estimator
    const estimator = document.querySelector('#estimator');
    if (estimator) {
      estimator.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.location.href = '/#estimator';
      return;
    }
    
    // Send message after short delay
    if (ctaMessage && onCTAClick) {
      setTimeout(() => {
        onCTAClick(ctaMessage);
      }, 800);
    }
  };

  // Intercept CTA link clicks in FAQ answers
  const handleAnswerClick = (e: React.MouseEvent, faq: FAQItem) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href') === '#estimator') {
      handleCTAClick(e, faq.ctaMessage);
    }
  };

  return (
    <section className={`bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-8 ${className}`}>
      <div className="space-y-3">
        <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">{title}</h2>
        <p className="text-slate-500 text-sm font-medium">Information, regulations, and best practices for restaurant sanitation in Los Angeles</p>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-amber-300"
          >
            <button
              type="button"
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 bg-slate-50 hover:bg-amber-50 transition-colors"
            >
              <div className="flex-1">
                {faq.category && (
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">
                    {faq.category}
                  </div>
                )}
                <h3 className="text-base lg:text-lg font-bold text-slate-900">
                  {faq.question}
                </h3>
              </div>
              <div className={`w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center transition-all flex-shrink-0 ${openIndex === index ? 'rotate-180 border-amber-500 bg-amber-50' : ''}`}>
                <i className={`fas fa-chevron-down text-xs ${openIndex === index ? 'text-amber-600' : 'text-slate-500'}`}></i>
              </div>
            </button>
            
            {openIndex === index && (
              <div className="px-6 py-6 bg-white border-t border-slate-100">
                <div 
                  className="text-slate-700 leading-relaxed space-y-3 text-sm lg:text-base prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                  onClick={(e) => handleAnswerClick(e, faq)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
