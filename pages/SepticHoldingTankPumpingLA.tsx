import React from 'react';
import { Link } from 'react-router-dom';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { ServiceLandingLinks } from '../components/ServiceLandingLinks';

const SepticHoldingTankPumpingLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: 'How often should a restaurant holding tank be pumped?',
      answer: '<p>Most restaurants schedule service every 2-8 weeks depending on tank size, customer volume, and kitchen discharge load. High-volume sites may need weekly service to avoid overflow risk.</p>'
    },
    {
      question: 'Is emergency pumping available?',
      answer: '<p>Yes. We provide emergency dispatch for critical overflow and backup situations. Service windows depend on location and access conditions.</p>'
    },
    {
      question: 'Do you provide compliance records?',
      answer: '<p>Yes. Every visit includes service receipts and disposal tracking documentation for inspection readiness.</p>'
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: 'Septic & Holding Tank Pumping Los Angeles',
    description: 'Septic and holding tank pumping for restaurants and commercial kitchens in Los Angeles with scheduled maintenance, emergency response, and compliance documentation.',
    areaServed: ['Los Angeles', 'Ventura', 'San Bernardino', 'Lancaster', 'Palmdale', 'Orange County', 'San Diego'],
    serviceType: 'Septic and Holding Tank Pumping Service',
    url: 'https://www.larestaurantservices.com/septic-holding-tank-pumping-los-angeles'
  });

  const faqSchema = buildFAQPageSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Septic & Holding Tank Pumping', url: 'https://www.larestaurantservices.com/septic-holding-tank-pumping-los-angeles' }
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
            <span className="text-slate-950 font-bold">Septic & Holding Tank Pumping</span>
          </nav>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100">
              <i className="fas fa-water"></i>
              <span>Restaurant Septic Support</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Septic & Holding Tank Pumping<br />
              <span className="text-blue-600">Los Angeles</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Reliable pumping for restaurant septic and holding systems. Prevent overflows, reduce downtime, and keep documentation ready for inspections.
            </p>
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Book Service in Minutes</h3>
              <p className="text-blue-100 text-sm font-medium">Scheduled maintenance and emergency dispatch available</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/instant-estimate?service=septic-holding-tank"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-blue-50 transition-all shadow-lg"
              >
                Get Instant Estimate
              </Link>
              <a
                href="tel:8186984252"
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call Dispatch
              </a>
              <Link
                to="/instant-estimate?service=septic-holding-tank&contact=message#dispatch-help"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Send Us a Message
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">What This Service Includes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-blue-900">Core Service Scope</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Full tank pump-out and regulated waste removal</li>
                  <li>• Access and condition review during visit</li>
                  <li>• Odor-control and site-safe cleanup workflow</li>
                  <li>• Service receipts and disposal tracking records</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-slate-900">Best Fit For</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Restaurants outside direct municipal sewer access</li>
                  <li>• Sites with recurring overflow or odor events</li>
                  <li>• Operators preparing for compliance review</li>
                  <li>• Multi-location kitchens needing predictable cadence</li>
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-slate-700 font-medium">
              <span className="font-black text-amber-800 uppercase tracking-[0.08em]">Operational note:</span> Emergency dispatch windows are prioritized for active overflow risk and health-code exposure.
            </div>
          </div>

          <ServiceLandingLinks currentPath="/septic-holding-tank-pumping-los-angeles" />

          <FAQSection faqs={faqs} />
        </div>
      </div>
    </>
  );
};

export default SepticHoldingTankPumpingLA;
