import React from 'react';
import { Link } from 'react-router-dom';

const RESOURCE_GUIDES = [
  {
    title: 'How a Grease Trap Works',
    path: '/how-a-grease-trap-works',
    description: 'A field-level explanation of separation, baffles, and why the 25% rule matters.',
  },
  {
    title: 'Which Restaurants Need Grease Traps?',
    path: '/which-restaurants-need-grease-traps-los-angeles',
    description: 'A practical guide to who needs a trap or interceptor in Los Angeles.',
  },
  {
    title: 'How to Verify a Trap Was Serviced',
    path: '/how-to-tell-if-grease-trap-was-serviced',
    description: 'What operators should look for after service and which records should exist.',
  },
  {
    title: 'Cleaning Frequency Guide',
    path: '/grease-trap-cleaning-frequency-guide',
    description: 'How volume, kitchen type, and trap size affect maintenance cadence.',
  },
  {
    title: 'FOG Sewer Impact in Los Angeles',
    path: '/fats-oils-grease-sewer-impact-los-angeles',
    description: 'Why fats, oils, and grease become a city sewer problem and a restaurant liability.',
  },
  {
    title: 'LA Health Inspection Guide',
    path: '/la-restaurant-health-inspection-guide',
    description: 'What inspectors tend to check and how to stay documentation-ready.',
  },
  {
    title: 'LA FOG Program Explained',
    path: '/la-fog-program-explained',
    description: 'A straightforward summary of the local FOG program and operator obligations.',
  },
  {
    title: 'Waste Manifest Explained',
    path: '/grease-trap-waste-manifest-explained',
    description: 'What manifests include, why they matter, and how they support compliance.',
  },
  {
    title: 'FOG Violations and Fines',
    path: '/restaurant-fog-violations-fines-los-angeles',
    description: 'Typical violation patterns, financial exposure, and preventable causes.',
  },
  {
    title: 'New Restaurant Compliance Guide',
    path: '/new-restaurant-grease-trap-compliance-la',
    description: 'Startup guidance for new openings getting grease trap compliance right early.',
  },
] as const;

export const ResourceGuidesSection: React.FC = () => {
  return (
    <section className="bg-white border border-slate-100 rounded-[2rem] shadow-xl p-8 lg:p-10 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">Resource Guides for Operators</h2>
        <p className="text-slate-600 font-medium">
          Browse detailed explainers built for restaurant owners, managers, and facilities teams handling FOG, inspections, and dispatch planning.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {RESOURCE_GUIDES.map((guide) => (
          <Link
            key={guide.path}
            to={guide.path}
            className="group rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-950 group-hover:text-amber-700 transition-colors">{guide.title}</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{guide.description}</p>
              </div>
              <i className="fas fa-arrow-right text-amber-500 mt-1"></i>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
