import React, { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
  className?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ 
  title = "Frequently Asked Questions", 
  faqs,
  className = ""
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
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
              aria-expanded={openIndex === index ? "true" : "false"}
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
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
