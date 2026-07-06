import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IntelligentEstimateForm } from './components/IntelligentEstimateForm';

const App: React.FC = () => {
  const [selectedServiceKey, setSelectedServiceKey] = useState<string | null>('grease-trap-interceptor');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const serviceKey = url.searchParams.get('service')?.trim().toLowerCase();
    if (!serviceKey) return;

    const validKeys = new Set([
      'grease-trap-interceptor',
      'septic-holding-tank',
      'hydro-jetting',
      'uco-recycling',
      'restroom-rentals',
      'compliance-audit',
      'hood-cleaning',
      'janitorial-services',
    ]);
    if (!validKeys.has(serviceKey)) return;

    setSelectedServiceKey(serviceKey);

    const estimator = document.getElementById('estimator');
    if (estimator) {
      estimator.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const services = [
    {
      title: "Grease Trap / Interceptor Pumping",
      key: 'grease-trap-interceptor',
      desc: "Commercial kitchen grease trap cleaning and interceptor pumping with full scrape and high-volume extraction.",
      icon: "fa-faucet",
      tag: "Indoor/Exterior"
    },
    {
      title: "Septic / Holding Tank Pumping",
      key: 'septic-holding-tank',
      desc: "Scheduled or emergency pumping for septic and holding tanks to keep sites compliant and odor-free.",
      icon: "fa-water",
      tag: "Septic"
    },
    {
      title: "Main Sewer Line Jetting / Hydro Jetting",
      key: 'hydro-jetting',
      desc: "Commercial hydro jetting for kitchen and sewer lines to clear stubborn FOG (fat, oil, grease) buildup.",
      icon: "fa-water-ladder",
      tag: "Emergency"
    },
    {
      title: "UCO Recycling",
      key: 'uco-recycling',
      desc: "Used cooking oil pickup and recycling with cleaner handling for restaurants and foodservice operations.",
      icon: "fa-recycle",
      tag: "Eco-Friendly"
    },
    {
      title: "Restroom Rentals",
      key: 'restroom-rentals',
      desc: "Premium portable restroom solutions for outdoor dining or facility renovations.",
      icon: "fa-restroom",
      tag: "Auxiliary"
    },
    {
      title: "Compliance Audit",
      key: 'compliance-audit',
      desc: "Full documentation and FOG reporting to keep your facility 100% health-code compliant.",
      icon: "fa-file-shield",
      tag: "Legal"
    },
    {
      title: "Hood Cleaning",
      key: 'hood-cleaning',
      desc: "Professional kitchen exhaust hood cleaning for fire safety and code compliance. Includes degreasing and filter service.",
      icon: "fa-broom",
      tag: "Kitchen"
    },
    {
      title: "Janitorial Services",
      key: 'janitorial-services',
      desc: "Restaurant sanitation and janitorial support for restrooms, dining areas, prep spaces, and back-of-house zones.",
      icon: "fa-soap",
      tag: "Sanitation"
    }
  ];

  const focusEstimator = () => {
    const element = document.getElementById('estimator');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const relatedPages = [
    { label: 'Grease Trap Cleaning', to: '/grease-trap-cleaning-los-angeles' },
    { label: 'Hydro Jetting', to: '/hydro-jetting-los-angeles' },
    { label: 'Compliance Audits', to: '/compliance-audits-los-angeles' },
    { label: 'Goslyn Installation', to: '/goslyn-installation-los-angeles' },
  ];

  return (
    <main className="py-12 lg:pt-16 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr,420px] gap-12 items-start">
            <div className="space-y-16">
              <div className="space-y-10">
                <h1 className="text-6xl lg:text-8xl font-black text-slate-950 leading-[0.9] tracking-tighter">
                  Running, Scaling, or Opening a <br/>
                  Commercial Kitchen in Los Angeles?
                </h1>
                
                <p className="text-2xl text-slate-500 leading-relaxed max-w-xl font-medium">
                  LA Restaurant Services helps <span className="text-slate-950 font-bold">restaurants, commercial kitchens, cafes, bars, hotels, ghost kitchens, shared kitchens, and foodservice operators</span> across Los Angeles and Southern California with grease trap cleaning, grease interceptor pumping, commercial hydro jetting, restaurant drain support, used cooking oil pickup, and restaurant waste services to prevent backups and support FOG compliance.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/instant-estimate"
                    className="inline-flex items-center justify-center bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-[0.12em] text-xs hover:bg-amber-400 transition-colors"
                  >
                    Get Instant Estimate
                  </Link>
                  <Link
                    to="/goslyn-installation-los-angeles"
                    className="inline-flex items-center justify-center bg-transparent border-2 border-slate-950 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-[0.12em] text-xs hover:bg-slate-950 hover:text-white transition-colors"
                  >
                    Zero-Maintenance Option
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 pt-6">
                  <div className="flex items-center gap-5 bg-white px-8 py-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                      <i className="fas fa-check-double"></i>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Partnership</div>
                      <div className="text-lg font-black text-slate-950">10% New Opening Discount</div>
                    </div>
                  </div>
                </div>
              </div>

              <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6" aria-labelledby="seo-content-heading">
                <h2 id="seo-content-heading" className="text-4xl font-black text-slate-950 tracking-tight">Grease Trap &amp; Interceptor Services in Los Angeles</h2>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Our grease trap cleaning and grease interceptor pumping services support restaurants and commercial kitchens across Los Angeles and Southern California with scheduled maintenance designed to prevent backups, reduce downtime, and keep teams ready for inspections.
                </p>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-900">Why Choose Us?</h2>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 font-medium">
                    <li>Grease trap cleaning, interceptor pumping, and drain support built for foodservice operations</li>
                    <li>Documented service records and manifests that support FOG compliance workflows</li>
                    <li>Scheduled maintenance planning for restaurants, cafes, bars, hotels, and shared kitchens</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-slate-900">Our Service Areas</h2>
                  <p className="text-slate-600 font-medium">We proudly serve the following regions:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-semibold">
                    <li>Los Angeles</li>
                    <li>Orange County</li>
                    <li>San Bernardino</li>
                    <li>Ventura</li>
                    <li>Lancaster / Palmdale</li>
                    <li>San Diego</li>
                  </ul>
                </div>
              </section>

              <div id="services" className="space-y-12 scroll-mt-32">
                <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">Our Core Solutions</h3>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Compliance Focused Sanitation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {services.map((service, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Request ${service.title}`}
                      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden cursor-pointer text-left w-full"
                      onClick={() => {
                        setSelectedServiceKey(service.key);
                        focusEstimator();
                      }}
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <i className={`fas ${service.icon} text-[80px]`}></i>
                      </div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-950 text-amber-500 rounded-2xl mb-6 shadow-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                          <i className={`fas ${service.icon} text-xl`}></i>
                        </div>
                        <div className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">{service.tag}</div>
                        <h4 className="text-xl font-black text-slate-950 mb-3 tracking-tight">{service.title}</h4>
                        <p className="text-sm text-slate-500 font-bold leading-relaxed">{service.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">Popular Service Pages</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/grease-trap-cleaning-los-angeles"
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      Grease Trap Cleaning
                    </Link>
                    <Link
                      to="/grease-trap-interceptor-pumping"
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      Interceptor Pumping
                    </Link>
                    <Link
                      to="/hydro-jetting-los-angeles"
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      Hydro Jetting
                    </Link>
                    <Link
                      to="/used-cooking-oil-pickup-los-angeles"
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      UCO Pickup
                    </Link>
                    <Link
                      to="/restaurant-waste-services"
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      Restaurant Waste Services
                    </Link>
                  </div>
                </div>
              </div>

              <section id="faq" className="scroll-mt-32 bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100">
                      <i className="fas fa-circle-question"></i>
                      <span>Knowledge Center</span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">Need answers before requesting service?</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      Review the key service and compliance questions, then request a quote through our instant estimate flow.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {relatedPages.map((page) => (
                        <Link
                          key={page.to}
                          to={page.to}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        >
                          {page.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="w-full lg:w-auto">
                    <Link
                      to="/faq"
                      className="inline-flex w-full lg:w-auto items-center justify-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.16em] text-xs hover:bg-black transition-all shadow-xl"
                    >
                      <i className="fas fa-book-open"></i>
                      <span>Open Full FAQ Page</span>
                    </Link>
                  </div>
                </div>
              </section>

            </div>

            <aside id="estimator" className="lg:sticky lg:top-24 self-start">
              <IntelligentEstimateForm
                key={`home-estimator-${selectedServiceKey ?? 'default'}`}
                initialServiceKey={selectedServiceKey}
              />
            </aside>
          </div>
        </div>
    </main>
  );
};

export default App;