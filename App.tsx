import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';

type LegalType = 'privacy' | 'compliance' | 'terms' | null;

const App: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [activeLegal, setActiveLegal] = useState<LegalType>(null);

  const services = [
    {
      title: "Grease Trap Cleaning",
      desc: "Specialized indoor service for units up to 50 gallons. Includes full scrape and debris removal.",
      icon: "fa-faucet",
      tag: "Indoor"
    },
    {
      title: "Interceptor Pumping",
      desc: "Large scale exterior grease interceptor maintenance with high-volume vacuum extraction.",
      icon: "fa-truck-field",
      tag: "Exterior"
    },
    {
      title: "Hydro Jetting",
      desc: "High-pressure line clearing to eliminate stubborn FOG (Fat, Oil, Grease) build-up.",
      icon: "fa-water-ladder",
      tag: "Emergency"
    },
    {
      title: "UCO Recycling",
      desc: "Used Cooking Oil collection and recycling. Sustainable solutions for your kitchen oil.",
      icon: "fa-recycle",
      tag: "Eco-Friendly"
    },
    {
      title: "Restroom Rentals",
      desc: "Premium portable restroom solutions for outdoor dining or facility renovations.",
      icon: "fa-restroom",
      tag: "Auxiliary"
    },
    {
      title: "Compliance Audit",
      desc: "Full documentation and FOG reporting to keep your facility 100% health-code compliant.",
      icon: "fa-file-shield",
      tag: "Legal"
    },
    {
      title: "Hood Cleaning",
      desc: "Professional kitchen exhaust hood cleaning for fire safety and code compliance. Includes degreasing and filter service.",
      icon: "fa-broom",
      tag: "Kitchen"
    },
    {
      title: "Janitorial Services",
      desc: "Comprehensive facility cleaning and sanitation for restrooms, dining areas, and kitchens. Nightly and deep-clean options available.",
      icon: "fa-soap",
      tag: "Sanitation"
    }
  ];

  const didDispatchRef = React.useRef(false);
  const triggerChatAction = (message?: string, focusOnly: boolean = false) => {
    const element = document.getElementById('estimator');
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth' });
    const timeoutId = setTimeout(() => {
      if (didDispatchRef.current) return;
      didDispatchRef.current = true;
      window.dispatchEvent(new CustomEvent('ais-trigger-chat', {
        detail: { message, focusOnly }
      }));
    }, 500);

    // In StrictMode dev, effect cleanup can run; return cleanup to avoid double dispatch.
    return () => clearTimeout(timeoutId);
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
        <span className="text-amber-400 mr-2">● 2026 Fleet Status:</span> 
        Operational in <span className="underline decoration-amber-400 underline-offset-4">Los Angeles</span> & <span className="underline decoration-amber-400 underline-offset-4">Orange County</span>
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
            <button onClick={() => scrollToSection('services')} className="hover:text-amber-600 transition-colors">Services</button>
            <div className="h-4 w-px bg-slate-200"></div>
            <button 
              onClick={() => triggerChatAction(undefined, true)}
              className="bg-amber-500 text-slate-950 px-10 py-4 rounded-full hover:bg-amber-400 transition-all font-black shadow-lg shadow-amber-200/50"
            >
              Instant Estimate
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-12 lg:pt-16 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr,420px] gap-12 items-start">
            <div className="space-y-16">
              <div className="space-y-10">
                <div className="inline-flex items-center gap-3 bg-amber-50 text-amber-700 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-amber-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Regional Dispatch Active
                </div>
                
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

              <div id="services" className="space-y-12 scroll-mt-32">
                <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-950 tracking-tighter uppercase">Our Core Solutions</h3>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Compliance Focused Sanitation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {services.map((service, idx) => (
                    <div
                      key={idx}
                      className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden cursor-pointer"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('greasy-select-service', { detail: { service: service.title } }));
                        window.dispatchEvent(new CustomEvent('ais-trigger-chat', { detail: { focusOnly: true } }));
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside id="estimator" className="lg:sticky lg:top-24 self-start">
              <div className="relative group h-[calc(100vh-160px)] max-h-[680px] flex flex-col min-h-0">
                <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-amber-200 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 pointer-events-none -z-10"></div>
                <div className="relative bg-slate-950 text-white p-6 rounded-t-[2.5rem] shadow-2xl flex items-center justify-between border-b border-white/5 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-[1rem] flex items-center justify-center transform group-hover:rotate-6 transition-transform shadow-lg shadow-amber-500/20">
                      <i className="fas fa-robot text-xl" aria-hidden="true"></i>
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-widest leading-none">THE GREASY AGENT</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Optimizing Route...</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden bg-white rounded-b-[2.5rem]">
                  <ChatInterface />
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
            
            <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 border-t border-white/5">
              <a href="https://www.allinsanitation.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-white transition-colors">
                <i className="fas fa-link text-[10px] text-amber-500"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">All In Sanitation</span>
              </a>
              <a href="https://portableluxuryrestrooms.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-white transition-colors">
                <i className="fas fa-link text-[10px] text-amber-500"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Luxury Flush</span>
              </a>
              <a href="https://www.saltedlightlycommissary.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-white transition-colors">
                <i className="fas fa-link text-[10px] text-amber-500"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Salted Lightly</span>
              </a>
            </div>
          </div>

          <div className="md:col-span-4">
             <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
                <h5 className="text-amber-500 font-black uppercase text-[9px] tracking-[0.3em]">Regional Dispatch</h5>
                <a href="tel:8186984252" className="text-4xl lg:text-5xl font-black text-white tracking-tighter hover:text-amber-500 transition-colors block">818.698.4252</a>
                <button 
                  onClick={() => triggerChatAction("I'd like to request a regional callback for a site survey.")}
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