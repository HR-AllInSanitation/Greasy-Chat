import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Signs Your Restaurant Needs Commercial Hydro Jetting in Los Angeles',
  description:
    'Slow drains, recurring clogs, odors, or grease buildup may signal that a Los Angeles restaurant needs commercial hydro jetting support.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/signs-restaurant-needs-hydro-jetting-los-angeles',
};

const SignsRestaurantNeedsHydroJettingLA: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'signs_hydro_jetting_la' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'Signs Restaurant Needs Hydro Jetting',
      url: 'https://www.larestaurantservices.com/signs-restaurant-needs-hydro-jetting-los-angeles',
    },
  ]);

  const signs = [
    {
      icon: 'fa-water',
      title: 'Slow drains that don\'t improve after plunging',
      detail:
        'A single slow drain might be a clog that a snake can clear. Multiple sinks draining slowly, even after a standard drain cleaning, signals hardened grease deposits inside the lines that need hydro jetting to blast out.',
    },
    {
      icon: 'fa-redo',
      title: 'Recurring backups every few weeks',
      detail:
        'If your kitchen has a backup, gets snaked, and then backs up again in 2–3 weeks, you are treating the symptom, not the cause. Hardened FOG inside the lines is being partially cleared but not fully removed. Hydro jetting scours the pipe walls completely.',
    },
    {
      icon: 'fa-nose',
      title: 'Persistent grease or rotten-egg odors from drains',
      detail:
        'Odor means anaerobic bacterial activity inside the pipes — a sign of old grease buildup and low flow. A quick drain cleaning might mask the smell temporarily, but hydro jetting clears the FOG deposit that is causing it.',
    },
    {
      icon: 'fa-sound',
      title: 'Gurgling or bubbling sounds from floor drains',
      detail:
        'Gurgling means air is getting trapped in the line instead of water flowing smoothly. This happens when FOG deposits narrow the pipe diameter and create turbulent flow. Hydro jetting opens the line back up.',
    },
    {
      icon: 'fa-sink',
      title: 'Multiple drain areas backing up at the same time',
      detail:
        'If floor drains, prep sinks, and the dish area all have backup issues during rush service, your grease trap may be at capacity and your lines may have FOG buildup. A <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease trap service</Link> + hydro jetting combo is often the solution.',
    },
    {
      icon: 'fa-fire-burner',
      title: 'Backups specifically during peak cooking hours',
      detail:
        'If drains are fine mid-morning but back up during lunch or dinner rush, the problem is volume-related. Your kitchen is discharging more grease than the lines can handle quickly. Hydro jetting increases line capacity by clearing FOG deposits.',
    },
  ];

  const whenToUse = [
    {
      title: 'Standard drain cleaning (snake)',
      uses: 'Clears single-drain clogs or food debris; temporary fix for one-time backups.',
    },
    {
      title: 'Grease trap service',
      uses: 'Maintains FOG separation; required every 4–8 weeks for compliance.',
    },
    {
      title: 'Commercial hydro jetting',
      uses: 'Blasts hardened FOG from inside drain lines; solves recurring backups and improves flow long-term.',
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
            <span className="text-slate-950 font-bold">Signs You Need Hydro Jetting</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-triangle-exclamation"></i>
              <span>Operational Support</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              Signs Your Restaurant Needs Commercial Hydro Jetting in Los Angeles
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              When slow drains or recurring clogs signal that your commercial kitchen needs more than a standard drain cleaning.
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
                <i className="fas fa-list-check"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The signs to watch for</h2>
            </div>
            <div className="grid gap-5 pl-14">
              {signs.map((sign, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <i className={`fas ${sign.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{sign.title}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-1">{sign.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-wrench"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What each solution does</h2>
            </div>
            <div className="pl-14 space-y-4">
              {whenToUse.map((item, idx) => (
                <div key={idx} className="border-l-4 border-amber-400 pl-4">
                  <p className="font-black text-slate-950 text-sm">{item.title}</p>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed mt-1">{item.uses}</p>
                </div>
              ))}
            </div>
            <p className="pl-14 mt-4 pt-4 border-t border-slate-100 text-slate-600 font-medium text-sm leading-relaxed">
              <strong>Bottom line:</strong> If drains are slow or back up frequently, your kitchen likely has hardened grease deposits inside the lines. A standard snake won't reach them. Hydro jetting uses high-pressure water to blast them out, improving flow long-term. Regular <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease trap maintenance</Link> prevents future buildup.
            </p>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-link"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Why grease traps and drain lines are connected</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Your grease trap and your kitchen drain lines are part of the same system. When your trap reaches 25% capacity, grease bypasses the baffle and enters the lines. When your lines have hardened FOG deposits, backups back into the trap. They work together.
              </p>
              <p>
                <strong>A one-part solution won't work:</strong> If you only service the trap but don't clear the lines, backups will continue. If you only hydro-jet the lines but don't maintain the trap, new grease will accumulate and clog the lines again.
              </p>
              <p>
                <strong>The two-part approach:</strong> Keep your trap on a predictable maintenance schedule, and use hydro jetting when backups are recurring. This combination keeps your kitchen operational and compliant.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">Don't wait for a bigger problem</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  One slow drain can become three. One backup during lunch can become a full kitchen shutdown. Early hydro jetting — before backups become emergency calls — saves time, money, and operational stress. Call as soon as you notice recurring drainage issues.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Experiencing drain issues?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">We offer <Link to="/hydro-jetting-los-angeles" className="text-amber-400 hover:text-amber-300 transition-colors underline">commercial hydro jetting</Link> and <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-400 hover:text-amber-300 transition-colors underline">grease trap cleaning</Link> to diagnose and fix recurring backups.</p>
            </div>
            <Link
              to="/instant-estimate?service=hydro-jetting&source=signs-hydro-jetting"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'signs_hydro_jetting_la', cta: 'get_estimate' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all whitespace-nowrap"
            >
              Request Hydro Jetting Estimate
            </Link>
          </section>

        </div>
      </div>
    </>
  );
};

export default SignsRestaurantNeedsHydroJettingLA;
