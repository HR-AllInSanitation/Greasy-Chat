import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Tell If Your Grease Trap Was Actually Serviced',
  description:
    'What a complete grease trap service looks like, the documentation you must receive, and the red flags that signal a rushed or incomplete job — from a technician who has seen both.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/how-to-tell-if-grease-trap-was-serviced',
};

const HowToVerifyGreaseTrapService: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'how_to_verify_grease_trap_service' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'How to Verify Grease Trap Service',
      url: 'https://www.larestaurantservices.com/how-to-tell-if-grease-trap-was-serviced',
    },
  ]);

  const completedSteps = [
    {
      step: '1',
      title: 'Measure FOG depth before starting',
      detail:
        'A thorough tech measures and records the FOG layer depth before pumping. This tells you how full the trap was and is the baseline for your compliance record. If no measurement was taken, there is no way to prove the service was timely under the 25% rule.',
    },
    {
      step: '2',
      title: 'Pump all three layers — not just the top',
      detail:
        'The whole point of the service is to remove the FOG cap, the middle effluent, and the sludge layer on the bottom. A tech who only skims the surface and calls it done has left the worst material behind. Total volume extracted should be consistent with the trap\'s size.',
    },
    {
      step: '3',
      title: 'Scrape and rinse baffle walls',
      detail:
        'The baffle (the divider inside the trap) accumulates a hard crust of solidified grease over time. If it is not scraped during service, the buildup eventually restricts flow and shortens the interval before your next overflow. A quick rinse alone does not count.',
    },
    {
      step: '4',
      title: 'Inspect baffles and lid gasket',
      detail:
        'Damaged baffles allow FOG to pass straight through to the sewer without separating — defeating the entire purpose of the trap. A cracked lid gasket can let odors escape into your kitchen. Both should be visually checked and noted in the service report.',
    },
    {
      step: '5',
      title: 'Record gallons extracted',
      detail:
        'The waste manifest requires documentation of the volume pumped. This is not optional. It tells you whether the service was consistent with your trap size and usage, and it is what LACDPH will ask for during an inspection.',
    },
    {
      step: '6',
      title: 'Issue the waste manifest before leaving',
      detail:
        'The manifest is a legal document certifying where your FOG waste went after it left your property. It must reference a licensed disposal or rendering facility. You should receive this before the truck drives away — not days later by email.',
    },
  ];

  const redFlags = [
    {
      icon: 'fa-clock',
      flag: 'In and out in under 10 minutes for a large trap',
      detail:
        'A 500+ gallon interceptor cannot be fully pumped, scraped, and inspected in 10 minutes. If the truck arrived, connected a hose, and left quickly, it is likely they vacuumed only the liquid and skipped the solids.',
    },
    {
      icon: 'fa-file-slash',
      flag: 'No manifest provided at the time of service',
      detail:
        'A legitimate licensed waste hauler always has the manifest form on the truck. If they say they will send it later — and then do not — you are left with no compliance record. That is your liability, not theirs.',
    },
    {
      icon: 'fa-question',
      flag: 'Cannot tell you where the waste went',
      detail:
        'If a technician cannot name the disposal or rendering facility, that is a serious red flag. FOG waste must be transported to a licensed facility. Illegal dumping is a felony in California and can be traced back to the generator (you).',
    },
    {
      icon: 'fa-magnifying-glass',
      flag: 'No measurement before or after',
      detail:
        'Professional service includes measuring the FOG layer depth before extraction so you know the trap was cleaned at the right time — not too early, not dangerously late. Skipping this step means the contractor cannot prove the service met the 25% rule.',
    },
    {
      icon: 'fa-circle-dollar-to-slot',
      flag: 'Unusually low price with no documentation',
      detail:
        'If someone quotes you significantly below market with no mention of manifests or compliance paperwork, they are likely cutting corners on disposal. In California, licensed manifest hauling has a cost floor. Prices that seem too good usually mean something is being skipped.',
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
            <span className="text-slate-950 font-bold">How to Verify Service Quality</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-shield-halved"></i>
              <span>Quality Verification Guide</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              How to Tell If Your Grease Trap Was Actually Serviced
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              What a thorough job looks like on the ground — and the warning signs that tell you corners were cut.
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
                <i className="fas fa-circle-check"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What a complete service includes</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              A proper grease trap service is not just pumping. It is a six-step process. Each step matters — both for the mechanical performance of your trap and for your compliance record.
            </p>
            <div className="pl-14 space-y-4 mt-2">
              {completedSteps.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{s.title}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-0.5">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Red flags to watch for</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              These are the patterns I see regularly in the field. Some are signs of laziness; others indicate a contractor who is not properly licensed. Either way, the compliance risk lands on you.
            </p>
            <div className="pl-14 space-y-5 mt-2">
              {redFlags.map((rf, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                    <i className={`fas ${rf.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{rf.flag}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-0.5">{rf.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-folder-open"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Documentation you must keep on file</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                LACDPH inspectors can ask for grease trap service records at any time during a routine inspection or
                a complaint-based investigation. The minimum you should have on file for each service:
              </p>
              <ul className="space-y-2 mt-2">
                {[
                  { doc: 'Waste Manifest', note: 'Required by California law — certifies legal transport and disposal of FOG waste' },
                  { doc: 'Service receipt', note: 'Date, time, technician name, gallons extracted' },
                  { doc: 'Pre-service FOG depth measurement', note: 'Proves the service was performed before the 25% threshold was breached' },
                  { doc: 'Disposal facility reference number', note: 'Traceability if LACDPH or LA Sanitation audits the disposal chain' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <i className="fas fa-check text-amber-500 mt-1 shrink-0"></i>
                    <span><strong className="text-slate-950">{item.doc}:</strong> {item.note}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Keep these records for a minimum of three years. Digital storage with a clear naming convention
                (date + location + gallons) makes retrieval fast during an unannounced inspection.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">The fine print on incomplete service</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  If your trap overflows and LACDPH investigates, having a manifest on file is not enough if the manifest
                  shows the service was done two weeks after the trap was already overdue. Timing and documentation
                  together are your defense. A contractor who cannot prove both has left you exposed — even if they
                  technically showed up.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Want service you can verify?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">We provide full documentation on every job — manifest, gallons, photos, compliance log.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=verify-service"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'how_to_verify_grease_trap_service', cta: 'get_estimate' })}
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

export default HowToVerifyGreaseTrapService;
