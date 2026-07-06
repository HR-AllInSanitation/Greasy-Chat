import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <main className="py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <section className="bg-white border border-slate-100 rounded-[2rem] shadow-xl p-10 lg:p-14 space-y-8">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Error 404</p>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-tight">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
            The page you requested is unavailable or may have moved. Use the links below to continue browsing
            restaurant sanitation and compliance resources.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-[0.12em] text-xs hover:bg-amber-400 transition-colors"
            >
              Go Home
            </Link>
            <Link
              to="/instant-estimate"
              className="inline-flex items-center justify-center bg-transparent border-2 border-slate-950 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-[0.12em] text-xs hover:bg-slate-950 hover:text-white transition-colors"
            >
              Instant Estimate
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default NotFound;
