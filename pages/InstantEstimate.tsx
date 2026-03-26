import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ComplexCaseWidget } from '../components/ComplexCaseWidget';
import { IntelligentEstimateForm } from '../components/IntelligentEstimateForm';
import { StructuredData, buildBreadcrumbSchema, buildServiceSchema } from '../components/StructuredData';

const InstantEstimate: React.FC = () => {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const serviceKey = search.get('service');

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Instant Estimate', url: 'https://www.larestaurantservices.com/instant-estimate' },
  ]);

  const serviceSchema = buildServiceSchema({
    name: 'Instant Restaurant Service Estimate',
    description: 'Fast quote form for grease trap pumping and restaurant sanitation service follow-up in Los Angeles.',
    areaServed: ['Los Angeles', 'Ventura', 'San Bernardino', 'Orange County', 'San Diego'],
    serviceType: 'Restaurant Sanitation Estimate',
    url: 'https://www.larestaurantservices.com/instant-estimate',
  });

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={serviceSchema} />

      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Instant Estimate</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-clipboard-list"></i>
              <span>Conversion Form</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Instant Estimate
              <br />
              <span className="text-amber-600">Structured for Speed</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl font-medium">
              Use the intelligent form to get a cleaner intake, faster quote generation, and a more trackable lead path.
            </p>
          </header>

          <div className="grid lg:grid-cols-[1fr,320px] gap-8 items-start">
            <IntelligentEstimateForm initialServiceKey={serviceKey} />
            <ComplexCaseWidget serviceKey={serviceKey} />
          </div>
        </div>
      </div>
    </>
  );
};

export default InstantEstimate;
