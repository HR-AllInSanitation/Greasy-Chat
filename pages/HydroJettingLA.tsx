import React from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../api/gtag-utils';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { ServiceLandingLinks } from '../components/ServiceLandingLinks';

const HydroJettingLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: 'When should a restaurant schedule hydro jetting?',
      answer: '<p>If drains back up repeatedly, water drains slowly, or odors persist after standard cleaning, hydro jetting is usually the next step.</p>'
    },
    {
      question: 'How is hydro jetting different from snaking?',
      answer: '<p>Snaking opens a path through a blockage. Hydro jetting uses high-pressure water to clean pipe walls and remove grease buildup more completely.</p>'
    },
    {
      question: 'Do you offer recurring preventive plans?',
      answer: '<p>Yes. We can set preventive service intervals based on kitchen output to reduce emergency shutdowns.</p>'
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: 'Hydro Jetting Los Angeles',
    description: 'Main sewer line and kitchen drain hydro jetting for restaurants in Los Angeles. High-pressure cleaning for grease buildup and recurring backups.',
    areaServed: ['Los Angeles', 'Ventura', 'San Bernardino', 'Lancaster', 'Palmdale', 'Orange County', 'San Diego'],
    serviceType: 'Hydro Jetting Service',
    url: 'https://www.larestaurantservices.com/hydro-jetting-los-angeles'
  });

  const faqSchema = buildFAQPageSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Hydro Jetting', url: 'https://www.larestaurantservices.com/hydro-jetting-los-angeles' }
  ]);

  return (
    <>
      <StructuredData data={serviceSchema} />
      <StructuredData data={faqSchema} />
      <StructuredData data={breadcrumbSchema} />

      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Hydro Jetting</span>
          </nav>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-purple-100">
              <i className="fas fa-water-ladder"></i>
              <span>High-Pressure Line Cleaning</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Hydro Jetting<br />
              <span className="text-purple-600">Los Angeles</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Clear persistent grease and debris from restaurant sewer lines with <Link to="/instant-estimate?service=hydro-jetting" className="text-purple-600 hover:text-purple-700 transition-colors font-semibold">commercial hydro jetting</Link>. Built for Los Angeles restaurants with recurring drain issues, including <Link to="/restaurant-waste-services" className="text-purple-600 hover:text-purple-700 transition-colors font-semibold">restaurant drain cleaning</Link> cases tied to heavy FOG output. This helps prevent backups, avoid downtime, and support scheduled maintenance plans for commercial kitchen operations. Pair this with <Link to="/grease-trap-cleaning-los-angeles" className="text-purple-600 hover:text-purple-700 transition-colors font-semibold">restaurant grease trap cleaning</Link> to reduce repeat blockages.
            </p>
          </div>

          <div className="bg-purple-600 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Solve Recurring Backups</h3>
              <p className="text-purple-100 text-sm font-medium">Commercial-kitchen line clearing for high-volume operations</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/instant-estimate?service=hydro-jetting"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-purple-50 transition-all shadow-lg"
              >
                Get Instant Estimate
              </Link>
              <a
                href="tel:8186984252"
                  onClick={() => trackEvent('support_page_cta_click', { page_type: 'hydro_jetting', cta: 'call_dispatch' })}
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call Dispatch
              </a>
              <Link
                to="/instant-estimate?service=hydro-jetting&contact=message#dispatch-help"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Send Us a Message
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">Service Highlights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-purple-900">What You Get</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• High-pressure cleaning focused on grease-heavy segments</li>
                  <li>• Better residual removal than basic snaking alone</li>
                  <li>• Deployable for preventive and urgent service scenarios</li>
                  <li>• Streamlined intake through instant estimate workflow</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-slate-900">When Operators Escalate</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Recurring line backups after recent cleaning</li>
                  <li>• Slow drains across multiple kitchen points</li>
                  <li>• Persistent sewer odor during peak service hours</li>
                  <li>• Pre-inspection risk reduction for FOG-heavy kitchens</li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-slate-700 font-medium">
              <span className="font-black text-amber-800 uppercase tracking-[0.08em]">Response priority:</span> Active backups and service interruption scenarios are routed first to reduce operational downtime.
            </div>
          </div>

          <ServiceLandingLinks currentPath="/hydro-jetting-los-angeles" />

          <FAQSection faqs={faqs} />
        </div>
      </div>
    </>
  );
};

export default HydroJettingLA;
