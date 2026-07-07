import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Grease Trap vs. Grease Interceptor: What Los Angeles Restaurants Need to Know',
  description:
    'Understand the difference between grease traps and grease interceptors for Los Angeles restaurants, commercial kitchens, and FOG maintenance planning.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/grease-trap-vs-grease-interceptor-los-angeles',
};

const GreaseTrapVsInterceptorLA: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'grease_trap_vs_interceptor_la' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'Grease Trap vs Interceptor',
      url: 'https://www.larestaurantservices.com/grease-trap-vs-grease-interceptor-los-angeles',
    },
  ]);

  const comparison = [
    {
      label: 'Size',
      trap: '10–100 gallons (under-sink or small indoor)',
      interceptor: '250 gallons to 2,000+ gallons (outdoor or large indoor)',
    },
    {
      label: 'Installation',
      trap: 'Typically under a sink or in a small indoor floor pit',
      interceptor: 'Usually installed outdoors or in a larger indoor/basement pit connected to main sewer',
    },
    {
      label: 'Designed for',
      trap: 'Small prep operations, coffee shops, light fryers',
      interceptor: 'Full-service restaurants, commissaries, high-volume kitchens, catering',
    },
    {
      label: 'Maintenance interval',
      trap: 'Weekly to bi-weekly for high-use kitchens',
      interceptor: 'Every 4–12 weeks depending on size and volume',
    },
    {
      label: 'Cost per service',
      trap: '$75–$150 per pumping',
      interceptor: '$250–$800+ depending on size and accessibility',
    },
  ];

  const functionalPoints = [
    {
      icon: 'fa-layer-group',
      title: 'Both use the same basic principle',
      detail:
        'A grease trap and a grease interceptor both work by gravity separation. Grease floats to the top, solids sink to the bottom, and cleaner water exits the outlet. The difference is scale and capacity, not function.',
    },
    {
      icon: 'fa-scale-balanced',
      title: 'The LACDPH calls large ones "interceptors"',
      detail:
        'In Los Angeles County regulations, grease traps and grease interceptors are technically the same device — they are all classified as "grease interceptors" in the code. Field technicians and restaurant operators often use both terms interchangeably, but they refer to the same type of equipment.',
    },
    {
      icon: 'fa-list-check',
      title: 'Both require regular maintenance and documentation',
      detail:
        'Whether you have a small under-sink trap or a 2,000-gallon outdoor interceptor, you need the same thing: predictable service, waste manifests, and compliance records. The maintenance schedule differs, but the documentation requirement is identical.',
    },
  ];

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />

      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-12">

          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <Link to="/best-practices" className="hover:text-amber-600 transition-colors">Resources</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Grease Trap vs Interceptor</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-question"></i>
              <span>Terminology Guide</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              Grease Trap vs. Grease Interceptor: What Los Angeles Restaurants Need to Know
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Understanding the difference, why the terms are often used interchangeably, and what your restaurant actually needs.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-xs">
                <i className="fas fa-hard-hat"></i>
              </div>
              <span className="text-sm font-bold text-slate-500">LA Restaurant Services · Field Technician Notes</span>
            </div>
          </header>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The simple answer</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                <strong>"Grease trap"</strong> usually refers to a small under-sink or compact unit (10–100 gallons).
              </p>
              <p>
                <strong>"Grease interceptor"</strong> usually refers to a larger unit (250+ gallons) installed outdoors or in a utility space.
              </p>
              <p>
                But both do the same thing: trap grease before it enters the city sewer. In Los Angeles County regulations, they are all classified as "grease interceptors." Field technicians often use the terms interchangeably, and there is no strict legal difference — it is mostly a matter of size and common usage.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-chart-column"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Side-by-side comparison</h2>
            </div>
            <div className="overflow-x-auto pl-14">
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="bg-slate-950 text-white">
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider">Factor</th>
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider">Grease Trap</th>
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider">Grease Interceptor</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-5 py-4 font-black text-slate-950">{row.label}</td>
                      <td className="px-5 py-4 text-slate-600 font-medium text-sm">{row.trap}</td>
                      <td className="px-5 py-4 text-slate-600 font-medium text-sm">{row.interceptor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Why they work the same way</h2>
            </div>
            <p className="text-slate-600 text-sm font-medium">
              Both devices use gravity separation to trap FOG, but they differ in size and capacity. To understand what happens when either reaches capacity, see <Link to="/why-restaurant-kitchen-drains-back-up-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">what causes restaurant kitchen drain backups</Link>. For high-volume drains, <Link to="/hydro-jetting-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">commercial hydro jetting</Link> may complement regular pumping.
            </p>
            <div className="grid gap-5 pl-14">
              {functionalPoints.map((point, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <i className={`fas ${point.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{point.title}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-1">{point.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-phone"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What to ask when scheduling service</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Whether you call it a grease trap or grease interceptor, the questions you need to answer are the same:
              </p>
              <ul className="space-y-2 text-sm font-medium">
                <li className="flex gap-3">
                  <span className="text-amber-600 font-black">1.</span>
                  <span>How large is your unit? (10 gal, 50 gal, 500 gal, 1000 gal?)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-black">2.</span>
                  <span>Where is it located? (under sink, outdoor pit, basement, etc.?)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-black">3.</span>
                  <span>When was it last serviced?</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-600 font-black">4.</span>
                  <span>How often should it be serviced based on your kitchen volume?</span>
                </li>
              </ul>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">Don't get caught up in terminology</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  The names "grease trap" and "grease interceptor" are used loosely in the field. What matters is that your equipment is properly sized for your kitchen volume, serviced on schedule, and documented for compliance. Use whichever term your service provider prefers — they know what you need.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Not sure what you have?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">We can assess your current setup and recommend the right <Link to="/restaurant-waste-services" className="text-amber-400 hover:text-amber-300 transition-colors underline">grease trap or interceptor service</Link> schedule for your kitchen.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=trap-vs-interceptor"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'grease_trap_vs_interceptor_la', cta: 'get_estimate' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all whitespace-nowrap"
            >
              Request Assessment
            </Link>
          </section>

        </div>
      </div>
    </>
  );
};

export default GreaseTrapVsInterceptorLA;
