import React from 'react';
import { Link } from 'react-router-dom';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 px-6 relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center gap-4 text-white">
            <div className="bg-amber-500 text-slate-950 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black">LA</div>
            <h2 className="text-2xl font-black tracking-tighter uppercase">LA Restaurant Services</h2>
          </div>
          <p className="text-[13px] leading-relaxed max-w-3xl font-medium text-slate-400">
            LA Restaurant Services helps restaurants open, operate, and grow without interruptions through reliable sanitation,
            waste, and compliance support.
          </p>

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
            <Link
              to="/instant-estimate?service=grease-trap-interceptor"
              className="block w-full bg-amber-500 text-slate-950 font-black py-4 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-[0.2em] text-[11px] text-center"
            >
              Request Callback
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">© 2026 LA Restaurant Services. HQ Dispatch: 13141 San Fernando Rd. Sylmar, CA.</p>
        <div className="flex gap-10 text-[9px] font-black uppercase tracking-widest text-slate-600">
          <span>Privacy</span>
          <span>Compliance</span>
          <span>Terms</span>
        </div>
      </div>
    </footer>
  );
};
