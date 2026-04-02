import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How Restaurants Reduce Environmental Impact from Kitchen Waste',
  description: 'Guide for reducing environmental impact in commercial kitchens through compliant grease control and used cooking oil recycling.',
  author: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
  },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.larestaurantservices.com/brand-hero.svg',
    },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/environmental-impact',
};

const EnvironmentalImpact: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'environmental_impact' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Environmental Impact', url: 'https://www.larestaurantservices.com/environmental-impact' },
  ]);

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />

      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Environmental Impact</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100">
              <i className="fas fa-leaf"></i>
              <span>Sustainability Guide</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Reduce Kitchen Environmental Impact
              <br />
              <span className="text-emerald-600">Without Slowing Operations</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl font-medium">
              Smart grease handling and UCO recycling protects municipal infrastructure, lowers contamination risk, and turns waste into recoverable value.
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-6">
            <article className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xl space-y-3">
              <h2 className="text-2xl font-black text-slate-950">1) Capture FOG at the source</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                Use sink strainers, pre-scrape stations, and strict no-grease-to-drain protocols to reduce downstream burden.
              </p>
            </article>

            <article className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xl space-y-3">
              <h2 className="text-2xl font-black text-slate-950">2) Recycle used cooking oil</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                Route UCO into certified collection channels to support biodiesel production and avoid illegal disposal exposure.
              </p>
            </article>

            <article className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xl space-y-3">
              <h2 className="text-2xl font-black text-slate-950">3) Keep disposal records ready</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                Track manifests, extraction logs, and service dates. Documentation supports compliance and operational accountability.
              </p>
            </article>

            <article className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xl space-y-3">
              <h2 className="text-2xl font-black text-slate-950">4) Prevent emergencies with cadence</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                Recurring service lowers spill risk and truck-roll emergency costs while improving budget predictability.
              </p>
            </article>
          </section>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Want a lower-impact operating plan?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Get a custom recommendation with your quote flow.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/instant-estimate?service=uco-recycling&source=environmental-impact"
                onClick={() => trackEvent('support_page_cta_click', { page_type: 'environmental_impact', cta: 'instant_estimate' })}
                className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all"
              >
                Get Instant Estimate
              </Link>
              <a
                href="tel:8186984252"
                onClick={() => trackEvent('support_page_cta_click', { page_type: 'environmental_impact', cta: 'call_dispatch' })}
                className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-white/20 transition-all"
              >
                Call Dispatch
              </a>
              <Link
                to="/instant-estimate?service=uco-recycling&contact=message&source=environmental-impact#dispatch-help"
                onClick={() => trackEvent('support_page_cta_click', { page_type: 'environmental_impact', cta: 'send_message' })}
                className="bg-transparent text-white px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-white/10 transition-all border border-dashed border-white/40"
              >
                Send Us a Message
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default EnvironmentalImpact;
