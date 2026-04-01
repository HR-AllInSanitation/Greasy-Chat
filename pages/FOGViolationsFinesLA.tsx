import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'FOG Violations and Fines in Los Angeles: What the Penalties Actually Look Like',
  description:
    'The real cost of grease trap non-compliance in LA — civil penalties, enforcement escalation, SSO liability, and how violations can be mitigated before they reach the maximum.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/restaurant-fog-violations-fines-los-angeles',
};

const FOGViolationsFinesLA: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'fog_violations_fines_la' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'FOG Violations and Fines in LA',
      url: 'https://www.larestaurantservices.com/restaurant-fog-violations-fines-los-angeles',
    },
  ]);

  const penaltyRows = [
    { violation: 'Missing service records (no manifest on file)', authority: 'LACDPH', penalty: 'Up to 4-point deduction + correction order', escalation: 'Re-inspection fee $185–$245' },
    { violation: 'FOG layer exceeds 25% capacity', authority: 'LACDPH / LASAN', penalty: 'Notice of Violation + up to 4-point deduction', escalation: '$500/day civil citation if uncorrected' },
    { violation: 'No grease interceptor installed', authority: 'LASAN', penalty: 'Mandatory installation order', escalation: 'Permit suspension until corrected' },
    { violation: 'Using an unlicensed waste hauler', authority: 'CalEPA / LASAN', penalty: '$1,000–$5,000 per incident', escalation: 'Joint liability with hauler for illegal disposal' },
    { violation: 'Intentional grease discharge to drain', authority: 'LASAN', penalty: '$500–$10,000 per day', escalation: 'Criminal referral for repeat violations' },
    { violation: 'Contributing to a Sanitary Sewer Overflow (SSO)', authority: 'LASAN / RWQCB', penalty: '$50,000+ for remediation costs', escalation: 'Civil lawsuit from affected parties' },
  ];

  const mitigationSteps = [
    {
      icon: 'fa-comments',
      title: 'Respond to the Notice of Violation immediately',
      detail:
        'The worst thing you can do is ignore a NOV. LASAN interprets non-response as non-compliance and escalates faster. Even if you disagree with the finding, acknowledge receipt and state your intended corrective action in writing. This creates a paper trail that works in your favor during any subsequent hearing.',
    },
    {
      icon: 'fa-calendar-check',
      title: 'Schedule the corrective service before the deadline',
      detail:
        'If the violation is a maintenance finding — overdue service, missing records — the fastest resolution is to service the trap immediately, collect the manifest, and submit copies to the issuing inspector. Violations with documented corrective action before the deadline are almost always resolved without the daily civil penalty kicking in.',
    },
    {
      icon: 'fa-file-lines',
      title: 'Build a compliance record going forward',
      detail:
        'Enforcement agencies consider your compliance history. A facility with three years of clean service records that has a single missed interval will be treated very differently than one with no records at all. Starting a clean maintenance calendar today shortens your enforcement exposure every month you stay current.',
    },
    {
      icon: 'fa-person-chalkboard',
      title: 'Request an informal hearing before formal citation',
      detail:
        'LASAN offers an informal hearing process before issuing a formal administrative citation. Request it in writing within the timeframe stated in your NOV. Come with service records, a corrective action plan, and evidence of current compliance. Most facilities that show genuine corrective effort get reduced penalties or extended timelines at this stage.',
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
            <span className="text-slate-950 font-bold">FOG Violations and Fines</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-triangle-exclamation"></i>
              <span>Regulations for Dummies</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              FOG Violations and Fines in Los Angeles: What the Penalties Actually Look Like
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              The numbers restaurants rarely see until it is too late — and how to avoid them or reduce them once they land.
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
                <i className="fas fa-circle-info"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Two separate agencies, two separate fine structures</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                FOG violations in Los Angeles can come from two different authorities — and they operate
                independently. You can receive a citation from one without the other being involved,
                or from both simultaneously if a situation is serious enough.
              </p>
              <p>
                <strong>LACDPH (LA County Department of Public Health)</strong> cites violations through the
                restaurant inspection scoring system. Penalties manifest as grade deductions, re-inspection fees,
                and correction orders. The financial exposure here is measured in hundreds of dollars per incident.
              </p>
              <p>
                <strong>LASAN (LA Sanitation and Environment)</strong> has civil enforcement authority over
                the FOG Control Program. They issue Notices of Violation, administrative citations, and can
                refer cases to the City Attorney for criminal prosecution. The financial exposure here starts
                at $500 per day and can reach tens of thousands of dollars if an SSO event is involved.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Violation and penalty reference table</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              These are real penalty structures currently in effect. Note that daily civil penalties continue
              to accrue until the violation is corrected and verified — the longer you wait, the larger the bill.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="bg-slate-950 text-white">
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider rounded-l-2xl">Violation</th>
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider">Authority</th>
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider">Initial Penalty</th>
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider rounded-r-2xl">If Uncorrected</th>
                  </tr>
                </thead>
                <tbody>
                  {penaltyRows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-5 py-4 font-medium text-slate-700 text-xs">{row.violation}</td>
                      <td className="px-5 py-4 font-black text-slate-950 text-xs">{row.authority}</td>
                      <td className="px-5 py-4 font-medium text-amber-700 text-xs">{row.penalty}</td>
                      <td className="px-5 py-4 font-medium text-red-700 text-xs">{row.escalation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-burst"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The SSO scenario — when it gets very serious</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                A Sanitary Sewer Overflow (SSO) caused by FOG is a different category of incident entirely.
                When sewage overflows into streets or reaches waterways, LASAN and the
                <strong> LA Regional Water Quality Control Board (RWQCB)</strong> investigate the contributing
                sources. If your facility is identified as an upstream contributor — through FOG sampling
                or inspection history — you can be held liable for a portion of the remediation costs.
              </p>
              <p>
                Remediation for a sewer overflow can include emergency pipeline clearing, environmental testing,
                public notification, and in cases involving beach closures, coordination with the Coastal
                Commission. Total costs for a significant event have historically reached $50,000 to $250,000.
                Liability is shared among contributing FSEs, but the investigation process itself is damaging
                to your permit standing — regardless of final cost allocation.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-shield-check"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">How to reduce a violation once you have one</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              Receiving a Notice of Violation is not the end of the road. Most first-time violations can be
              resolved without the maximum penalty if you respond correctly. Here is what actually works:
            </p>
            <div className="pl-14 space-y-4">
              {mitigationSteps.map((ms, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <i className={`fas ${ms.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{ms.title}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-0.5">{ms.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">The cheapest violation is the one that never happens</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  A scheduled maintenance contract with a licensed hauler costs a fraction of a single administrative
                  citation — and eliminates the enforcement risk entirely. I have helped restaurants work through
                  violation responses. None of them wanted to be there. The ones who had documentation on their
                  side always had a much better outcome than the ones who did not.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Eliminate your violation risk</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Scheduled service, licensed disposal, and documentation that protects you at every inspection.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=violations-fines"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'fog_violations_fines_la', cta: 'get_estimate' })}
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

export default FOGViolationsFinesLA;
