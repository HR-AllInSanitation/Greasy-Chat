import React from 'react';
import { Link } from 'react-router-dom';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { ServiceLandingLinks } from '../components/ServiceLandingLinks';

const JanitorialServicesLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: 'What areas are typically covered in restaurant janitorial service?',
      answer: '<p>Plans usually include dining areas, restrooms, kitchen-adjacent surfaces, entry points, and high-touch zones with sanitation-focused routines.</p>'
    },
    {
      question: 'Do you offer nightly and deep-clean schedules?',
      answer: '<p>Yes. We support nightly, multi-day weekly, and periodic deep-clean service options.</p>'
    },
    {
      question: 'Can janitorial service be combined with waste/compliance services?',
      answer: '<p>Yes. Many operators bundle janitorial work with grease, UCO, and compliance workflows for a single operational cadence.</p>'
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: 'Janitorial Services Los Angeles',
    description: 'Restaurant-focused janitorial services in Los Angeles including restroom sanitation, dining area cleaning, and recurring maintenance plans.',
    areaServed: ['Los Angeles', 'Ventura', 'San Bernardino', 'Lancaster', 'Palmdale', 'Orange County', 'San Diego'],
    serviceType: 'Janitorial Cleaning Service',
    url: 'https://www.larestaurantservices.com/janitorial-services-los-angeles'
  });

  const faqSchema = buildFAQPageSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Janitorial Services', url: 'https://www.larestaurantservices.com/janitorial-services-los-angeles' }
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
            <span className="text-slate-950 font-bold">Janitorial Services</span>
          </nav>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100">
              <i className="fas fa-soap"></i>
              <span>Operational Cleanliness</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Janitorial Services<br />
              <span className="text-emerald-600">Los Angeles</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Restaurant-focused janitorial support designed for daily presentation, sanitation consistency, and operational reliability.
            </p>
          </div>

          <div className="bg-emerald-600 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Keep Standards High</h3>
              <p className="text-emerald-100 text-sm font-medium">Nightly and deep-clean schedules available</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/instant-estimate?service=janitorial-services"
                className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-emerald-50 transition-all shadow-lg"
              >
                Request Estimate
              </a>
              <a
                href="tel:8186984252"
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call: 818.698.4252
              </a>
              <a
                href="/instant-estimate?service=janitorial-services"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Complex Case Review
              </a>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">Program Components</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-emerald-900">Cleaning Program Scope</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Restroom, dining area, and high-touchpoint sanitation</li>
                  <li>• Nightly upkeep plus scheduled deep-clean cycles</li>
                  <li>• Flexible staffing windows around service hours</li>
                  <li>• Coordinated workflows with waste/compliance ops</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-slate-900">Business Impact</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Cleaner guest-facing areas during peak traffic</li>
                  <li>• Reduced sanitation drift between shifts</li>
                  <li>• Better consistency across multi-location teams</li>
                  <li>• Faster readiness for inspection scenarios</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-slate-700 font-medium">
              <span className="font-black text-blue-800 uppercase tracking-[0.08em]">Execution model:</span> Service plans are mapped to operating rhythm so cleaning quality remains stable without interrupting kitchen throughput.
            </div>
          </div>

          <ServiceLandingLinks currentPath="/janitorial-services-los-angeles" />

          <FAQSection faqs={faqs} />
        </div>
      </div>
    </>
  );
};

export default JanitorialServicesLA;
