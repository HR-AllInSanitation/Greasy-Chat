import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const AboutUs: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'about_us' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'About Us', url: 'https://www.larestaurantservices.com/about-us' },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />

      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">About Us</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-building"></i>
              <span>About LA Restaurant Services</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Built for Restaurant Operators
              <br />
              <span className="text-amber-600">Who Cannot Afford Downtime</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl font-medium">
              We help restaurants open, operate, and scale without interruptions through compliant waste and sanitation services: grease trap pumping,
              UCO recycling, hydro-jet support, and related operational services.
            </p>
          </header>

          <section className="grid md:grid-cols-3 gap-6">
            <article className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xl space-y-3">
              <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <i className="fas fa-shield-check"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950">Compliance First</h2>
              <p className="text-slate-600 font-medium">Every service is documented for inspections with manifests and service history.</p>
            </article>

            <article className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xl space-y-3">
              <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                <i className="fas fa-truck-fast"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950">Dispatch Reliability</h2>
              <p className="text-slate-600 font-medium">Regional coverage with rapid response windows and clear follow-up.</p>
            </article>

            <article className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xl space-y-3">
              <div className="w-11 h-11 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center">
                <i className="fas fa-chart-line"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950">Growth-Oriented</h2>
              <p className="text-slate-600 font-medium">We design service plans around operational continuity and margin protection.</p>
            </article>
          </section>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Need a service plan for your location?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Get a structured estimate in about 60 seconds.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/instant-estimate?source=about-us"
                onClick={() => trackEvent('support_page_cta_click', { page_type: 'about_us', cta: 'instant_estimate' })}
                className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all"
              >
                Get Instant Estimate
              </Link>
              <a
                href="tel:8186984252"
                onClick={() => trackEvent('support_page_cta_click', { page_type: 'about_us', cta: 'call_dispatch' })}
                className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-white/20 transition-all"
              >
                Call Dispatch
              </a>
              <Link
                to="/instant-estimate?contact=message&source=about-us#dispatch-help"
                onClick={() => trackEvent('support_page_cta_click', { page_type: 'about_us', cta: 'send_message' })}
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

export default AboutUs;
