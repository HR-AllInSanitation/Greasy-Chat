import React from 'react';
import { Link } from 'react-router-dom';

const servicesMenu = [
  { label: 'Grease Trap Cleaning', path: '/grease-trap-cleaning-los-angeles' },
  { label: 'Used Cooking Oil Pickup', path: '/used-cooking-oil-pickup-los-angeles' },
  { label: 'Hydro Jetting', path: '/hydro-jetting-los-angeles' },
  { label: 'Restroom Trailer Rentals', path: '/restroom-trailer-rentals-los-angeles' },
  { label: 'Janitorial Services', path: '/janitorial-services-los-angeles' },
  { label: 'All Services', path: '/restaurant-waste-services' },
];

const companyMenu = [
  { label: 'About Us', path: '/about-us' },
  { label: 'FAQ', path: '/faq' },
];

const resourcesMenu = [
  { label: 'Best Practices', path: '/best-practices' },
  { label: 'Environmental Impact', path: '/environmental-impact' },
];

export const SiteHeader: React.FC = () => {
  return (
    <>
      <div className="bg-[#0F172A] text-white py-3 px-6 text-center text-[11px] font-black uppercase tracking-[0.25em] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        <span className="text-amber-400 mr-2">● Coverage Area:</span>
        Los Angeles, Ventura, San Bernardino, Lancaster/Palmdale, San Diego, Orange County & beyond!
      </div>

      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-100 px-6 py-5 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-5 group cursor-pointer">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-slate-950 leading-none uppercase">LA Restaurant Services</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">HQ Dispatch: Sylmar, CA</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-[12px] font-black text-slate-500 uppercase tracking-widest">
            <div className="relative group">
              <button type="button" className="inline-flex items-center gap-2 hover:text-amber-600 transition-colors">
                <span>Services</span>
                <i className="fas fa-chevron-down text-[10px]"></i>
              </button>
              <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="w-[320px] bg-white border border-slate-100 rounded-2xl shadow-2xl p-3 normal-case tracking-normal">
                  {servicesMenu.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <button type="button" className="inline-flex items-center gap-2 hover:text-amber-600 transition-colors">
                <span>Company</span>
                <i className="fas fa-chevron-down text-[10px]"></i>
              </button>
              <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="w-[240px] bg-white border border-slate-100 rounded-2xl shadow-2xl p-3 normal-case tracking-normal">
                  {companyMenu.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <button type="button" className="inline-flex items-center gap-2 hover:text-amber-600 transition-colors">
                <span>Resources</span>
                <i className="fas fa-chevron-down text-[10px]"></i>
              </button>
              <div className="absolute left-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="w-[260px] bg-white border border-slate-100 rounded-2xl shadow-2xl p-3 normal-case tracking-normal">
                  {resourcesMenu.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.14em] text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to="/instant-estimate"
              className="bg-amber-500 text-slate-950 px-8 py-4 rounded-full hover:bg-amber-400 transition-all font-black shadow-lg shadow-amber-200/50"
            >
              Instant Estimate
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};
