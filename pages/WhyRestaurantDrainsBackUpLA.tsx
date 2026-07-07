import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Why Restaurant Kitchen Drains Keep Backing Up in Los Angeles',
  description:
    'Learn why Los Angeles restaurant drains back up, how grease buildup affects commercial kitchens, and when hydro jetting or grease trap service may help.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/why-restaurant-kitchen-drains-back-up-los-angeles',
};

const WhyRestaurantDrainsBackUpLA: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'why_restaurant_drains_backup_la' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'Why Restaurant Drains Back Up',
      url: 'https://www.larestaurantservices.com/why-restaurant-kitchen-drains-back-up-los-angeles',
    },
  ]);

  const causes = [
    {
      icon: 'fa-droplets',
      title: 'Grease and FOG (fats, oils, grease) buildup',
      detail:
        'Every dish pan, prep sink, and floor drain in a commercial kitchen discharges grease. Over weeks and months, this FOG accumulates inside drain lines, traps, and interceptors. It hardens, traps food particles, and narrows the pipe diameter until flow slows to a crawl.',
    },
    {
      icon: 'fa-water',
      title: 'Undersized grease trap or interceptor',
      detail:
        'If your trap is too small for your actual kitchen volume, it reaches 25% capacity before scheduled service. Grease bypasses the baffle and clogs downstream lines, causing floor drain backups and slow prep sinks.',
    },
    {
      icon: 'fa-bowl-food',
      title: 'Food particles and debris accumulation',
      detail:
        'Solid food waste — vegetable scraps, meat bits, rice, pasta — combines with grease inside drain lines and traps. This sludge builds up faster than grease alone and is harder to clear with a simple drain snake.',
    },
    {
      icon: 'fa-pipe',
      title: 'Old or corroded pipes',
      detail:
        'Older commercial kitchens may have galvanized or cast iron drain lines that have corroded internally, creating rough surfaces where FOG and food particle sticks. New drains are smoother and drain faster, but even new lines clog if grease traps are not serviced regularly.',
    },
  ];

  const backupScenarios = [
    { area: 'Floor drains', symptom: 'Water pools or drains slowly after dishwashing' },
    { area: 'Prep sinks', symptom: 'Water backs up when multiple sinks drain at once' },
    { area: 'Dish room', symptom: 'Dishwasher outlet backs up into prep area or floors' },
    { area: 'Multiple locations', symptom: 'Several areas back up at the same time during rush periods' },
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
            <span className="text-slate-950 font-bold">Why Drains Back Up</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-triangle-exclamation"></i>
              <span>Operational Support</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              Why Restaurant Kitchen Drains Keep Backing Up in Los Angeles
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              The connection between grease traps, drain lines, and operational downtime — and when cleaning or hydro jetting may help.
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
                <i className="fas fa-message-dots"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The direct answer</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Restaurant kitchen drains back up because <strong>grease and food debris accumulate faster than they drain.</strong> This happens in three main places: inside your grease trap (when it fills past 25% capacity), inside drain lines (when FOG hardens and narrows the pipe), and at floor drains (when the main trap is over-capacity and grease bypasses the baffle).
              </p>
              <p>
                One backup is a symptom. <strong>Recurring backups</strong> signal that your grease trap service is not keeping up with your actual kitchen discharge — or your drain lines need hydro jetting to clear hardened FOG buildup.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-list-check"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The main causes</h2>
            </div>
            <div className="grid gap-5 pl-14">
              {causes.map((cause, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <i className={`fas ${cause.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{cause.title}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-1">{cause.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-pipes"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Where backups happen and what they tell you</h2>
            </div>
            <div className="pl-14 space-y-3">
              {backupScenarios.map((scenario, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs font-black mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{scenario.area}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-0.5">{scenario.symptom}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pl-14 mt-4 pt-4 border-t border-slate-100 text-slate-600 font-medium text-sm leading-relaxed">
              <p>
                <strong>Multiple areas backing up at once?</strong> This usually means your main grease trap is at or past capacity. A grease trap service is the first step. If backups persist after service, your drain lines may have hardened FOG deposits that need <Link to="/hydro-jetting-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">commercial hydro jetting</Link> to clear. Check <Link to="/signs-restaurant-needs-hydro-jetting-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">signs your restaurant needs hydro jetting</Link> and <Link to="/grease-trap-interceptor-pumping" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease interceptor pumping</Link> to assess your situation.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-hourglass-end"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Why quick fixes don't solve recurring backups</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                A plumber with a drain snake can clear a temporary clog, but if the underlying problem is an over-capacity grease trap or hardened FOG deposits in the lines, the backup will return in days or weeks. You end up paying for repeated service calls instead of fixing the root cause.
              </p>
              <p>
                The solution is two-part: <strong>First,</strong> ensure your <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease trap is serviced on schedule</Link> and never exceeds 25% capacity. See <Link to="/restaurant-grease-trap-cleaning-frequency-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">how often Los Angeles restaurants need grease trap service</Link> for intervals by kitchen type. <strong>Second,</strong> if backups persist, use hydro jetting to blast out hardened FOG inside the drain lines, then maintain a regular service schedule to prevent recurrence.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">The grease trap and drain line are connected</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  Your grease trap is not just a single component — it is part of your kitchen's entire drainage system. An over-capacity trap dumps grease directly into lines. Lines with hardened FOG don't drain properly, backing up into the trap. They work together. Regular trap service + periodic hydro jetting = reliable drainage and zero backups during service.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Experiencing recurring backups?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">We offer <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-400 hover:text-amber-300 transition-colors underline">grease trap cleaning</Link> and <Link to="/hydro-jetting-los-angeles" className="text-amber-400 hover:text-amber-300 transition-colors underline">hydro jetting</Link> to diagnose and fix the problem.</p>
            </div>
            <Link
              to="/instant-estimate?service=hydro-jetting&source=why-restaurant-drains-backup"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'why_restaurant_drains_backup_la', cta: 'get_estimate' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all whitespace-nowrap"
            >
              Request Service Estimate
            </Link>
          </section>

        </div>
      </div>
    </>
  );
};

export default WhyRestaurantDrainsBackUpLA;
