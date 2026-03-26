import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceLandingLink {
  title: string;
  path: string;
}

const SERVICE_LANDING_LINKS: ServiceLandingLink[] = [
  { title: 'Grease Trap Cleaning', path: '/grease-trap-cleaning-los-angeles' },
  { title: 'Used Cooking Oil Pickup', path: '/used-cooking-oil-pickup-los-angeles' },
  { title: 'Restroom Trailer Rentals', path: '/restroom-trailer-rentals-los-angeles' },
  { title: 'Septic Holding Tank Pumping', path: '/septic-holding-tank-pumping-los-angeles' },
  { title: 'Hydro Jetting', path: '/hydro-jetting-los-angeles' },
  { title: 'Compliance Audits', path: '/compliance-audits-los-angeles' },
  { title: 'Hood Cleaning', path: '/hood-cleaning-los-angeles' },
  { title: 'Janitorial Services', path: '/janitorial-services-los-angeles' },
];

interface ServiceLandingLinksProps {
  currentPath: string;
}

export const ServiceLandingLinks: React.FC<ServiceLandingLinksProps> = ({ currentPath }) => {
  const links = SERVICE_LANDING_LINKS.filter((service) => service.path !== currentPath);

  return (
    <section className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">Explore More Restaurant Services</h2>
        <p className="text-slate-600 font-medium">Compare related services and request the right estimate flow for your operation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((service) => (
          <Link
            key={service.path}
            to={service.path}
            className="group border border-slate-200 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-slate-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <i className="fas fa-arrow-right text-[10px] text-amber-500"></i>
              <span>{service.title}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
