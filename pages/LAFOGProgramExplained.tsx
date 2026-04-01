import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "LA's FOG Program Explained: What the City Actually Requires From Your Restaurant",
  description:
    "A plain breakdown of the City of Los Angeles Bureau of Sanitation FOG Control Program — what it is, what it requires, what Best Management Practices mean, and what non-compliance looks like.",
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/la-fog-program-explained',
};

const LAFOGProgramExplained: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'la_fog_program_explained' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: "LA FOG Program Explained",
      url: 'https://www.larestaurantservices.com/la-fog-program-explained',
    },
  ]);

  const bmps = [
    {
      icon: 'fa-screwdriver-wrench',
      title: 'Install and maintain a properly sized interceptor',
      detail:
        'The interceptor must be sized based on your kitchen fixture units and cooking equipment load. Sizing is calculated during the permitting process and must be approved by the Bureau of Sanitation before occupancy. An undersized interceptor does not meet BMP — even if it is technically present.',
    },
    {
      icon: 'fa-gauge-high',
      title: 'Service the interceptor before reaching 25% capacity',
      detail:
        'This is the core maintenance requirement. The combined depth of the FOG layer and bottom sludge must not exceed 25% of the total liquid capacity. You are responsible for scheduling service proactively — waiting until it overflows is not a defense.',
    },
    {
      icon: 'fa-file-lines',
      title: 'Use a licensed waste hauler and keep the manifest',
      detail:
        'Every service must be performed by a California-licensed waste hauler. The waste manifest — documenting the hauler, the volume removed, and the disposal facility — must be retained for three years and produced on demand during any inspection or audit.',
    },
    {
      icon: 'fa-users',
      title: 'Train kitchen staff on FOG reduction practices',
      detail:
        'BMPs include operational practices, not just equipment. Staff must be trained to scrape plates before washing, not pour grease down drains, and use dry cleanup methods for spills before washing. Documented staff training can be requested during a compliance audit.',
    },
    {
      icon: 'fa-droplet-slash',
      title: 'Never discharge grease directly to the drain',
      detail:
        'Intentional grease dumping — pouring fryer oil down a drain, flushing grease with hot water to force it through — is a direct violation. It bypasses the interceptor entirely and is one of the fastest ways to trigger enforcement action.',
    },
  ];

  const enforcementSteps = [
    { step: '1', label: 'Notice of Violation', detail: 'Written notice issued after an inspection finding. Gives you a corrective action deadline — typically 30 days.' },
    { step: '2', label: 'Re-inspection', detail: 'Inspector returns to verify corrections. If violations persist, the case escalates to formal enforcement.' },
    { step: '3', label: 'Administrative Citation', detail: 'Civil penalty issued — $500 per day per violation is the standard starting rate for active non-compliance.' },
    { step: '4', label: 'Compliance Order', detail: 'Formal legal order requiring specific corrective actions on a defined timeline. Failure to comply can trigger permit suspension.' },
    { step: '5', label: 'Permit Suspension or Revocation', detail: 'In cases of repeated or egregious violations, LA Sanitation can suspend your discharge permit — effectively forcing your kitchen offline.' },
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
            <span className="text-slate-950 font-bold">LA FOG Program Explained</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-scale-balanced"></i>
              <span>Regulations for Dummies</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              The LA FOG Program Explained: What the City Actually Requires From Your Restaurant
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Most restaurant owners have heard of it. Few know exactly what it says. Here is the whole thing, in plain English.
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
                <i className="fas fa-building-columns"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What the FOG Program actually is</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                The <strong>City of Los Angeles Bureau of Sanitation FOG (Fats, Oils, and Grease) Control Program</strong>
                is a regulatory framework — backed by the city municipal code — that applies to every Food Service
                Establishment (FSE) that discharges into the city sewer system. It exists because FOG from
                commercial kitchens is the number one cause of sanitary sewer overflows (SSOs) in Los Angeles.
              </p>
              <p>
                The program is administered by the <strong>LA Sanitation and Environment (LASAN)</strong> branch
                of the Bureau of Sanitation. They have enforcement authority separate from LACDPH health inspectors —
                meaning you can be fully compliant on a health inspection and still face an FOG enforcement action
                from LASAN for inadequate grease management. Both agencies can cite you. Both can fine you.
              </p>
              <p>
                The program also operates in coordination with the <strong>LA Regional Water Quality Control Board</strong>,
                which oversees water pollution standards. An SSO caused by your FOG discharge can involve all three agencies.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-list-check"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Best Management Practices — what that term means</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              The FOG Program uses the term <strong>Best Management Practices (BMPs)</strong> to describe the specific
              operational and equipment requirements it places on FSEs. Meeting BMPs is not optional — they are
              the compliance standard. Here is each one, and what it means in practice:
            </p>
            <div className="pl-14 space-y-4">
              {bmps.map((bmp, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <i className={`fas ${bmp.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{bmp.title}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-0.5">{bmp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-gavel"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">How enforcement escalates</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              LASAN uses a progressive enforcement model. It does not start with the maximum penalty — but it does
              reach it if violations are not corrected. Here is how the escalation sequence typically works:
            </p>
            <div className="pl-14 space-y-3">
              {enforcementSteps.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{s.label}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-0.5">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-circle-question"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Does the FOG Program apply to my kitchen?</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                If your operation is within the City of Los Angeles boundaries, prepares or serves food, and
                discharges to a city-owned sewer line — yes, it applies. This includes restaurants, food trucks
                operating out of a commissary connected to city sewer, ghost kitchens, school cafeterias,
                hospital kitchens, hotel dining operations, and catering commissaries.
              </p>
              <p>
                If you are in unincorporated LA County (outside city limits), the applicable program is run by
                the <strong>Los Angeles County Sanitation Districts</strong> rather than the city Bureau of
                Sanitation — but the requirements are substantially similar. When in doubt, contact the
                sanitation district that serves your address.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">The program is free to comply with — just not free to ignore</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  LASAN does not charge a fee just for being an FSE subject to the FOG Program. The only costs
                  are the ones you choose: pay for regular service and documentation, or eventually pay far more
                  in citations, re-inspections, and potential emergency remediation. In 15 years of field work,
                  I have never seen a kitchen that saved money by skipping grease maintenance.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Get fully FOG-compliant today</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">We handle interceptor service, licensed disposal, and the documentation the city requires.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=fog-program-explained"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'la_fog_program_explained', cta: 'get_estimate' })}
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

export default LAFOGProgramExplained;
