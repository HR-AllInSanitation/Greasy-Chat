import React from 'react';
import { Link } from 'react-router-dom';
import { FAQSection, FAQItem } from '../components/FAQSection';
import { StructuredData, buildServiceSchema, buildFAQPageSchema, buildBreadcrumbSchema } from '../components/StructuredData';
import { ServiceLandingLinks } from '../components/ServiceLandingLinks';

const ComplianceAuditsLA: React.FC = () => {
  const faqs: FAQItem[] = [
    {
      question: 'What documents are included in compliance support?',
      answer: '<p>We provide service receipts, manifest-aligned disposal records, and operational notes that help restaurants stay inspection-ready.</p>'
    },
    {
      question: 'Can this be bundled with pumping services?',
      answer: '<p>Yes. Compliance support is commonly paired with grease trap, UCO, septic, and jetting programs.</p>'
    },
    {
      question: 'Is this useful for multi-location operations?',
      answer: '<p>Yes. Multi-site operators can use centralized records and recurring documentation workflows.</p>'
    }
  ];

  const serviceSchema = buildServiceSchema({
    name: 'Compliance Audits Los Angeles',
    description: 'Restaurant sanitation and FOG compliance audit support in Los Angeles, including reporting workflows and documentation readiness.',
    areaServed: ['Los Angeles', 'Ventura', 'San Bernardino', 'Lancaster', 'Palmdale', 'Orange County', 'San Diego'],
    serviceType: 'Compliance Audit Service',
    url: 'https://www.larestaurantservices.com/compliance-audits-los-angeles'
  });

  const faqSchema = buildFAQPageSchema(faqs);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Compliance Audits', url: 'https://www.larestaurantservices.com/compliance-audits-los-angeles' }
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
            <span className="text-slate-950 font-bold">Compliance Audits</span>
          </nav>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-slate-200">
              <i className="fas fa-file-shield"></i>
              <span>Inspection Readiness</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Compliance Audits<br />
              <span className="text-slate-700">Los Angeles</span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Keep your operation ready for inspections with structured sanitation documentation and practical service workflows.
            </p>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight">Strengthen Compliance Now</h3>
              <p className="text-slate-300 text-sm font-medium">Fast intake and coordinated office review available</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/instant-estimate?service=compliance-audit"
                className="bg-amber-500 text-slate-950 px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-amber-400 transition-all shadow-lg"
              >
                Start Audit Request
              </a>
              <a
                href="tel:8186984252"
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/20 transition-all border border-white/20"
              >
                Call: 818.698.4252
              </a>
              <a
                href="/instant-estimate?service=compliance-audit"
                className="bg-transparent text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide text-sm hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Complex Case Review
              </a>
            </div>
          </div>

          <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">Audit Support Scope</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-slate-900">Documentation Layer</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• FOG and sanitation record readiness review</li>
                  <li>• Service-log structure for inspection response</li>
                  <li>• Manifest-aligned record hygiene recommendations</li>
                  <li>• Cadence guidance by operation profile</li>
                </ul>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-lg font-black text-amber-900">Operator Outcomes</h3>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Faster response during inspection requests</li>
                  <li>• Reduced missed-service documentation gaps</li>
                  <li>• Better consistency across multiple locations</li>
                  <li>• Clear escalation path for complex compliance cases</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-slate-700 font-medium">
              <span className="font-black text-blue-800 uppercase tracking-[0.08em]">Recommended:</span> Pair audit support with recurring service scheduling to keep records current, not just reactive.
            </div>
          </div>

          <ServiceLandingLinks currentPath="/compliance-audits-los-angeles" />

          <FAQSection faqs={faqs} />
        </div>
      </div>
    </>
  );
};

export default ComplianceAuditsLA;
