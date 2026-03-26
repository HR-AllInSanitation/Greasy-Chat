import React from 'react';
import { Link } from 'react-router-dom';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { ServiceLandingLinks } from '../components/ServiceLandingLinks';

const HoodCleaningLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: 'Why is hood cleaning critical for restaurants?',
      answer: '<p>Grease accumulation in hoods and duct paths increases fire risk and can trigger compliance issues. Regular cleaning supports safer kitchen operation.</p>'
    },
    {
      question: 'Can service be scheduled after hours?',
      answer: '<p>Yes. Night and off-peak scheduling can be arranged to reduce impact on operating hours.</p>'
    },
    {
      question: 'Do you coordinate with other sanitation services?',
      answer: '<p>Yes. Hood cleaning can be bundled with grease trap, UCO, and janitorial workflows.</p>'
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: 'Hood Cleaning Los Angeles',
    description: 'Professional hood cleaning for restaurant kitchens in Los Angeles with fire-safety focused degreasing and operational scheduling.',
    areaServed: ['Los Angeles', 'Ventura', 'San Bernardino', 'Lancaster', 'Palmdale', 'Orange County', 'San Diego'],
    serviceType: 'Kitchen Hood Cleaning Service',
    url: 'https://www.larestaurantservices.com/hood-cleaning-los-angeles'
  });

  const faqSchema = buildFAQPageSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Hood Cleaning', url: 'https://www.larestaurantservices.com/hood-cleaning-los-angeles' }
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
            <span className="text-slate-950 font-bold">Hood Cleaning</span>
          </nav>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-broom"></i>
              <span>Kitchen Exhaust Hygiene</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Hood Cleaning<br />
              <span className="text-amber-600">Los Angeles</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Reduce kitchen fire risk and improve code readiness with scheduled hood and exhaust cleaning for commercial food operations.
            </p>
          </div>

          <div className="bg-amber-600 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Protect Your Kitchen</h3>
              <p className="text-amber-100 text-sm font-medium">Service plans built for restaurant operating schedules</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/instant-estimate?service=hood-cleaning"
                className="bg-white text-amber-700 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-amber-50 transition-all shadow-lg"
              >
                Request Estimate
              </Link>
              <a
                href="tel:8186984252"
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call: 818.698.4252
              </a>
              <Link
                to="/instant-estimate?service=hood-cleaning"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Complex Case Review
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">Included in Hood Cleaning Service</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-amber-900">Scope of Work</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Degreasing on accessible hood surfaces</li>
                  <li>• Filter service and replacement guidance</li>
                  <li>• Service-status notes for maintenance continuity</li>
                  <li>• Scheduling windows designed for low disruption</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-slate-900">Ideal For</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• High-volume fry kitchens and grill concepts</li>
                  <li>• Restaurants with strict fire-risk policies</li>
                  <li>• Operators standardizing preventive maintenance</li>
                  <li>• Multi-unit brands enforcing system consistency</li>
                </ul>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-sm text-slate-700 font-medium">
              <span className="font-black text-rose-800 uppercase tracking-[0.08em]">Fire-safety focus:</span> Regular hood maintenance reduces grease load and lowers operational risk during peak kitchen throughput.
            </div>
          </div>

          <ServiceLandingLinks currentPath="/hood-cleaning-los-angeles" />

          <FAQSection faqs={faqs} />
        </div>
      </div>
    </>
  );
};

export default HoodCleaningLA;
