import React from 'react';
import { Link } from 'react-router-dom';
import { FAQSection } from '../components/FAQSection';
import { faqs } from '../data/faqData';
import { StructuredData, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const FAQPage: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'faq' });
  }, []);

  const faqSchema = buildFAQPageSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'FAQ', url: 'https://www.larestaurantservices.com/faq' },
  ]);

  return (
    <>
      <StructuredData data={faqSchema} />
      <StructuredData data={breadcrumbSchema} />

      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Frequently Asked Questions</span>
          </nav>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-circle-question"></i>
              <span>Knowledge Center</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Best practices, compliance guidance, and service details for restaurant operators in Los Angeles and Southern California.
            </p>
          </div>

          <div className="bg-slate-950 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Need a quote now?</h2>
              <p className="text-slate-400 text-sm font-medium">Use the instant estimator to get pricing in about 60 seconds.</p>
            </div>
            <Link
              to="/instant-estimate?source=faq"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'faq', cta: 'instant_estimate' })}
              className="bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-amber-400 transition-all shadow-lg"
            >
              Go to Instant Estimate
            </Link>
          </div>

          <FAQSection title="Restaurant Services FAQ" faqs={faqs} />
        </div>
      </div>
    </>
  );
};

export default FAQPage;
