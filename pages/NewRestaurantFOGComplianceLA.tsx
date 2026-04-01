import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Opening a New Restaurant in LA: Your Grease Trap and FOG Compliance Checklist',
  description:
    'Step-by-step guide to grease trap permitting, sizing, and FOG compliance requirements for new restaurant openings in Los Angeles — from permit application through your first health inspection.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/new-restaurant-grease-trap-compliance-la',
};

const NewRestaurantFOGComplianceLA: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'new_restaurant_fog_compliance' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'New Restaurant FOG Compliance Checklist',
      url: 'https://www.larestaurantservices.com/new-restaurant-grease-trap-compliance-la',
    },
  ]);

  const steps = [
    {
      phase: 'Before you sign the lease',
      icon: 'fa-key',
      items: [
        {
          title: 'Confirm whether the existing space has an interceptor',
          detail:
            'Ask the landlord or the previous tenant. If there is an existing interceptor, get the specifications: size in gallons, location, last service date, and whether it passed the most recent health inspection. An undersized or non-compliant interceptor from a previous tenant is your problem the moment you take over the space.',
        },
        {
          title: 'Verify the sewer connection type',
          detail:
            'Some older commercial spaces have private lateral lines that connect to a main sewer at an odd location. This affects interceptor placement. Your plumber needs to know the sewer line path before bidding the interceptor installation.',
        },
      ],
    },
    {
      phase: 'Permitting phase',
      icon: 'fa-file-signature',
      items: [
        {
          title: 'Submit your kitchen plan to LACDPH Environmental Health',
          detail:
            'New restaurant permits require plan review. Submit your kitchen layout, equipment list, and proposed grease interceptor specifications. LACDPH will determine whether the interceptor size and placement are adequate. Do not purchase or install the unit before this approval.',
        },
        {
          title: 'Get the FOG interceptor approved by the Bureau of Sanitation',
          detail:
            'If you are within City of LA limits, your interceptor also needs approval from the Bureau of Sanitation before installation. This is a separate step from the LACDPH plan review. Missing it means your interceptor may not be recognized under the FOG Control Program — even if it passes a health inspection.',
        },
        {
          title: 'Pull the plumbing permit',
          detail:
            'Interceptor installation requires a plumbing permit from the LA Department of Building and Safety (LADBS). Work done without a permit can result in a stop-work order and require demolition and reinstallation. Use a licensed plumber who will pull the permit on your behalf.',
        },
      ],
    },
    {
      phase: 'Installation phase',
      icon: 'fa-wrench',
      items: [
        {
          title: 'Size the interceptor correctly — do not guess',
          detail:
            'Interceptor sizing is calculated using a formula based on the number of drainage fixture units (DFUs) in your kitchen, the type of cooking equipment, and the number of dishwasher cycles per hour. This is not a judgment call. Use the LACDPH or Bureau of Sanitation sizing worksheet, or have a licensed engineer calculate it. An undersized trap will fail its first inspection.',
        },
        {
          title: 'Locate the interceptor for access',
          detail:
            'Outdoor interceptors must be accessible for pumping without requiring equipment to be moved. In LA kitchens where outdoor space is limited, this often means coordinating with the landlord on the concrete cut location and lid placement. A trap that your service provider cannot access easily is one that will be neglected.',
        },
        {
          title: 'Schedule the final plumbing inspection',
          detail:
            'After installation, LADBS must sign off on the plumbing permit. This inspection confirms the interceptor is installed per code. No certificate of occupancy will issue until all plumbing inspections are cleared.',
        },
      ],
    },
    {
      phase: 'Before opening day',
      icon: 'fa-door-open',
      items: [
        {
          title: 'Establish your service schedule with a licensed hauler',
          detail:
            'Do not wait until after opening to find a grease service provider. Set up your maintenance schedule before you open so you have an established cadence from day one. Your first service should be scheduled within the first 30 days of operation — new traps fill faster before the bacterial baseline is established.',
        },
        {
          title: 'Train your kitchen team on FOG Best Management Practices',
          detail:
            'Before service starts, brief your entire kitchen staff on the four core behaviors: scrape plates before washing, never pour grease down a drain, use dry cleanup methods for spills before mopping, and report any slow drains immediately. One untrained employee can undo a compliant system quickly.',
        },
        {
          title: 'Set up your compliance record-keeping system',
          detail:
            'Create a physical folder and a digital folder on day one. Every manifest and service receipt goes in both locations, labeled with the date. When your first LACDPH inspection comes — and it will come within the first 60 to 90 days of a new permit — you want to be able to produce records immediately.',
        },
      ],
    },
    {
      phase: 'First 90 days of operation',
      icon: 'fa-chart-line',
      items: [
        {
          title: 'Expect your first health inspection within 60–90 days',
          detail:
            'New restaurant permits in LA County typically receive a pre-opening inspection (before you open to the public) and a follow-up operational inspection within the first 90 days. The first inspection is often more detailed for new operations than for established ones. Have everything documented and accessible.',
        },
        {
          title: 'Calibrate your service frequency based on real fill rates',
          detail:
            'Your first few service visits will tell you how fast your trap actually fills based on your menu and volume. Ask your technician to measure and document the FOG depth at each visit. After two or three services, you will have enough data to set a reliable interval that keeps you safely under the 25% threshold.',
        },
      ],
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
            <span className="text-slate-950 font-bold">New Restaurant Compliance Checklist</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-rocket"></i>
              <span>Regulations for Dummies</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              Opening a New Restaurant in LA: Your Grease Trap and FOG Compliance Checklist
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Every step you need to clear — from signing the lease to passing your first inspection — so grease compliance is never what holds you back.
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
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Why grease compliance trips up new openings</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                I have been on-site at restaurants that were weeks away from opening when they discovered
                their interceptor was undersized, not approved by the Bureau of Sanitation, or installed
                without a plumbing permit. In each case, the fix delayed the opening — sometimes by two to
                four weeks — and cost significantly more than doing it right the first time would have.
              </p>
              <p>
                The mistakes are almost always the same: assuming the previous tenant left a compliant setup,
                trusting a contractor who skipped the permit step, or not knowing that LACDPH and the Bureau
                of Sanitation are two separate approvals. This checklist addresses all of them.
              </p>
            </div>
          </article>

          {steps.map((phase, pidx) => (
            <article key={pidx} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                  <i className={`fas ${phase.icon}`}></i>
                </div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">{phase.phase}</h2>
              </div>
              <div className="pl-14 space-y-5">
                {phase.items.map((item, iidx) => (
                  <div key={iidx} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fas fa-check text-[10px]"></i>
                    </div>
                    <div>
                      <p className="font-black text-slate-950 text-sm">{item.title}</p>
                      <p className="text-slate-600 font-medium text-sm leading-relaxed mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">New openings get a discount on their first service</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  We offer a 10% discount for new restaurant openings on their first grease trap service and
                  setup consultation. Starting your maintenance calendar with documented service from day one
                  is the strongest compliance position you can have — and we want to help you build it correctly.
                  Mention this article when you contact us.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Opening soon? Get your setup right from day one</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">New opening discount applies. We cover installation guidance, first service, and compliance documentation.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=new-restaurant-checklist"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'new_restaurant_fog_compliance', cta: 'get_estimate' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all whitespace-nowrap"
            >
              Get My Estimate
            </Link>
          </section>

        </div>
      </div>
    </>
  );
};

export default NewRestaurantFOGComplianceLA;
