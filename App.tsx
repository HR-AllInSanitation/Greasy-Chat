import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IntelligentEstimateForm } from './components/IntelligentEstimateForm';

type LegalType = 'privacy' | 'compliance' | 'terms' | null;

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
  const [activeLegal, setActiveLegal] = useState<LegalType>(null);

  const services = [
    {
      title: "Grease Trap / Interceptor Pumping",
      key: 'grease-trap-interceptor',
      desc: "Specialized indoor and exterior grease system maintenance with full scrape and high-volume extraction.",
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
      desc: "High-pressure line clearing to eliminate stubborn FOG (Fat, Oil, Grease) build-up.",
      icon: "fa-water-ladder",
      tag: "Emergency"
    },
    {
      title: "UCO Recycling",
      key: 'uco-recycling',
      desc: "Used Cooking Oil collection and recycling. Sustainable solutions for your kitchen oil.",
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
      desc: "Comprehensive facility cleaning and sanitation for restrooms, dining areas, and kitchens. Nightly and deep-clean options available.",
      icon: "fa-soap",
      tag: "Sanitation"
    }
  ];

  const serviceLandingLinks = [
    { label: 'Grease Trap Cleaning', path: '/grease-trap-cleaning-los-angeles' },
    { label: 'Used Cooking Oil Pickup', path: '/used-cooking-oil-pickup-los-angeles' },
    { label: 'Restroom Trailer Rentals', path: '/restroom-trailer-rentals-los-angeles' },
    { label: 'Septic Holding Tank Pumping', path: '/septic-holding-tank-pumping-los-angeles' },
    { label: 'Hydro Jetting', path: '/hydro-jetting-los-angeles' },
    { label: 'Compliance Audits', path: '/compliance-audits-los-angeles' },
    { label: 'Hood Cleaning', path: '/hood-cleaning-los-angeles' },
    { label: 'Janitorial Services', path: '/janitorial-services-los-angeles' },
  ];

  const focusEstimator = () => {
    const element = document.getElementById('estimator');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderLegalContent = () => {
    switch (activeLegal) {
      case 'privacy':
        return {
          title: "Privacy & Data Policy",
          content: "At LA Restaurant Services, we respect your privacy. Data collected via 'The Greasy Agent' is used exclusively to provide service estimates and follow-up communications. We do not sell your data."
        };
      case 'compliance':
        return {
          title: "Regional Compliance Standards",
          content: "All services are performed in strict accordance with the Southern California FOG Control Program. Our disposal processes are EPA-registered and we provide manifest documentation for every service."
        };
      case 'terms':
        return {
          title: "California Service Terms",
          content: "Estimates provided by the Greasy Agent are non-binding ranges based on user input. Final service cost is subject to onsite inspection of system condition and accessibility."
        };
      default:
        return null;
    }
  };

  const legal = renderLegalContent();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FDFDFF]">
      {/* Announcement Bar */}
      <div className="bg-[#0F172A] text-white py-3 px-6 text-center text-[11px] font-black uppercase tracking-[0.25em] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        <span className="text-amber-400 mr-2">● Coverage Area:</span>
        Los Angeles, Ventura, San Bernardino, Lancaster/Palmdale, San Diego, Orange County & beyond!
      </div>

      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-5 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter text-slate-950 leading-none uppercase">LA Restaurant Services</h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">HQ Dispatch: Sylmar, CA</span>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[12px] font-black text-slate-500 uppercase tracking-widest">
            <div className="relative group">
              <button type="button" className="inline-flex items-center gap-2 hover:text-amber-600 transition-colors">
                <span>Services</span>
                <i className="fas fa-chevron-down text-[10px]"></i>
              </button>
              <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="w-[360px] bg-white border border-slate-100 rounded-2xl shadow-2xl p-3 normal-case tracking-normal">
                  {serviceLandingLinks.map((serviceLink) => (
                    <Link
                      key={serviceLink.path}
                      to={serviceLink.path}
                      className="block px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      {serviceLink.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => scrollToSection('services')}
                    className="mt-1 w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    View Services Grid
                  </button>
                </div>
              </div>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <Link to="/faq" className="hover:text-amber-600 transition-colors">FAQ</Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <Link to="/about-us" className="hover:text-amber-600 transition-colors">About</Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <Link to="/best-practices" className="hover:text-amber-600 transition-colors">Best Practices</Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <Link to="/environmental-impact" className="hover:text-amber-600 transition-colors">Environmental</Link>
            <div className="h-4 w-px bg-slate-200"></div>
            <Link
              to="/instant-estimate"
              className="bg-amber-500 text-slate-950 px-10 py-4 rounded-full hover:bg-amber-400 transition-all font-black shadow-lg shadow-amber-200/50"
            >
              Instant Estimate
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-12 lg:pt-16 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr,420px] gap-12 items-start">
            <div className="space-y-16">
              <div className="space-y-10">
                <h2 className="text-6xl lg:text-8xl font-black text-slate-950 leading-[0.9] tracking-tighter">
                  Opening a New Restaurant <br/>
                  in Los Angeles? 
                </h2>
                
                <p className="text-2xl text-slate-500 leading-relaxed max-w-xl font-medium">
                  Scale without interruptions. OUR <span className="text-amber-600 font-black uppercase tracking-tight">GREASY AGENT</span> calculates <span className="text-slate-950 font-bold">precise service estimates</span> keeping your facility health-code ready.
                </p>

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
                <h1 id="seo-content-heading" className="text-4xl font-black text-slate-950 tracking-tight">Grease Trap Services in Los Angeles</h1>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Our grease trap pumping services in Los Angeles keep your restaurant ready for health inspections while minimizing downtime. We specialize in eco-friendly collection, compliant hauling, and proactive maintenance plans.
                </p>
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-slate-900">Why Choose Us?</h2>
                  <ul className="list-disc list-inside text-slate-600 space-y-2 font-medium">
                    <li>Eco-friendly solutions with documented disposal manifests</li>
                    <li>Affordable pricing and transparent estimates</li>
                    <li>Fast, reliable dispatch for scheduled and emergency service</li>
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
                      We moved our full FAQ library into a dedicated page so this homepage stays focused on instant estimates and lead capture.
                    </p>
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
              <div className="space-y-5">
                <div className="bg-white border border-slate-100 rounded-[2rem] shadow-xl p-6 space-y-4">
                  <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-amber-100">
                    <i className="fas fa-file-signature"></i>
                    <span>Intelligent Estimator</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">Request pricing in a dedicated estimate box</h3>
                    <p className="text-sm text-slate-600 font-medium mt-2">Choose a service, complete the form, and route complex cases to office review without the old chat-style shell.</p>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                  <IntelligentEstimateForm
                    key={`home-estimator-${selectedServiceKey ?? 'default'}`}
                    initialServiceKey={selectedServiceKey}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="bg-slate-950 text-slate-400 py-12 px-6 relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-amber-500 text-slate-950 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black">LA</div>
              <h1 className="text-2xl font-black tracking-tighter uppercase">LA Restaurant Services</h1>
            </div>
            <p className="text-[13px] leading-relaxed max-w-3xl font-medium text-slate-400">
              LA Restaurant Services exists to help restaurants open, operate, and grow without interruptions by handling critical sanitation, waste, and compliance needs before problems arise. We partner with owners early to deliver reliable grease trap, UCO, waste, and restroom solutions that protect their business and keep them focused on serving customers.
            </p>
            
            <div className="pt-6 border-t border-white/5">
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-500 mb-4">Partners</h4>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <a href="https://www.allinsanitation.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 hover:text-white transition-colors">
                  <i className="fas fa-truck text-base text-amber-500"></i>
                  <span className="text-[13px] font-black uppercase tracking-widest">All In Sanitation</span>
                </a>
                <a href="https://portableluxuryrestrooms.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 hover:text-white transition-colors">
                  <i className="fas fa-restroom text-base text-amber-500"></i>
                  <span className="text-[13px] font-black uppercase tracking-widest">Luxury Flush</span>
                </a>
                <a href="https://www.saltedlightlycommissary.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 hover:text-white transition-colors">
                  <i className="fas fa-utensils text-base text-amber-500"></i>
                  <span className="text-[13px] font-black uppercase tracking-widest">Salted Lightly</span>
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-500 mb-4">Resources</h4>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <Link to="/about-us" className="group flex items-center gap-3 hover:text-white transition-colors">
                  <i className="fas fa-building text-base text-amber-500"></i>
                  <span className="text-[13px] font-black uppercase tracking-widest">About Us</span>
                </Link>
                <Link to="/faq" className="group flex items-center gap-3 hover:text-white transition-colors">
                  <i className="fas fa-circle-question text-base text-amber-500"></i>
                  <span className="text-[13px] font-black uppercase tracking-widest">FAQ</span>
                </Link>
                <Link to="/best-practices" className="group flex items-center gap-3 hover:text-white transition-colors">
                  <i className="fas fa-lightbulb text-base text-amber-500"></i>
                  <span className="text-[13px] font-black uppercase tracking-widest">Best Practices</span>
                </Link>
                <Link to="/environmental-impact" className="group flex items-center gap-3 hover:text-white transition-colors">
                  <i className="fas fa-leaf text-base text-amber-500"></i>
                  <span className="text-[13px] font-black uppercase tracking-widest">Environmental Impact</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
             <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
                <h5 className="text-amber-500 font-black uppercase text-[9px] tracking-[0.3em]">Regional Dispatch</h5>
                <a href="tel:8186984252" className="text-4xl lg:text-5xl font-black text-white tracking-tighter hover:text-amber-500 transition-colors block">818.698.4252</a>
                <button 
                  type="button"
                  onClick={() => {
                    setSelectedServiceKey('grease-trap-interceptor');
                    focusEstimator();
                  }}
                  className="w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-[0.2em] text-[11px]"
                >
                  Request Callback
                </button>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
           <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">© 2026 LA Restaurant Services. HQ Dispatch: 13141 San Fernando Rd. Sylmar, CA.</p>
           <div className="flex gap-10 text-[9px] font-black uppercase tracking-widest text-slate-600">
             <button onClick={() => setActiveLegal('privacy')} className="hover:text-amber-500 transition-colors">Privacy</button>
             <button onClick={() => setActiveLegal('compliance')} className="hover:text-amber-500 transition-colors">Compliance</button>
             <button onClick={() => setActiveLegal('terms')} className="hover:text-amber-500 transition-colors">Terms</button>
           </div>
        </div>
      </footer>

      {/* Legal Modal */}
      {activeLegal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md" onClick={() => setActiveLegal(null)}>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-10">
              <h3 className="text-xl font-black text-slate-950 tracking-tighter uppercase mb-6">{legal?.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed text-sm mb-8">{legal?.content}</p>
              <button onClick={() => setActiveLegal(null)} className="w-full bg-slate-950 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;