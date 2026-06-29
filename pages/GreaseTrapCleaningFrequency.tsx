import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How Often Does a Grease Trap Really Need to Be Cleaned?',
  description:
    'A practical frequency guide based on trap size, kitchen type, and the LA County 25% rule — including how summer heat in Los Angeles affects cleaning intervals.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/grease-trap-cleaning-frequency-guide',
};

const GreaseTrapCleaningFrequency: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'grease_trap_cleaning_frequency' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'Grease Trap Cleaning Frequency Guide',
      url: 'https://www.larestaurantservices.com/grease-trap-cleaning-frequency-guide',
    },
  ]);

  const frequencyRows = [
    { size: '10–25 gal', type: 'Under-sink, high-volume fryer operations', interval: 'Weekly or bi-weekly', note: 'Fast food, taco stands, Korean BBQ' },
    { size: '50–100 gal', type: 'Under-sink, moderate cooking volume', interval: 'Every 2–4 weeks', note: 'Sandwich shops, cafes with cooking' },
    { size: '250–500 gal', type: 'Interior or small outdoor interceptor', interval: 'Every 4–6 weeks', note: 'Mid-size restaurants, catering prep' },
    { size: '500–750 gal', type: 'Standard outdoor interceptor', interval: 'Every 4–8 weeks', note: 'Full-service restaurants' },
    { size: '1,000–1,500 gal', type: 'Large outdoor interceptor', interval: 'Every 8–12 weeks', note: 'High-volume restaurants, hotel kitchens' },
    { size: '2,000+ gal', type: 'Industrial or multi-establishment interceptor', interval: 'Every 3–6 months', note: 'Commissaries, institutional kitchens' },
  ];

  const menuFactors = [
    {
      icon: 'fa-fire-burner',
      label: 'High FOG accumulation',
      detail: 'Deep frying, carnitas, birria, Korean BBQ, Chinese dim sum, fried chicken. These kitchens can fill a 500-gallon trap in half the time compared to a light-fare cafe.',
    },
    {
      icon: 'fa-leaf',
      label: 'Low FOG accumulation',
      detail: 'Salad bars, juice counters, sushi operations with minimal hot cooking. Still require regular service, just at longer intervals than high-fat menus.',
    },
    {
      icon: 'fa-droplets',
      label: 'High dishwasher throughput',
      detail: 'Banquet facilities and high-turnover restaurants run dozens of dishwasher cycles per shift. Hot water from heavy dishwashing accelerates FOG emulsification and trap loading.',
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
            <span className="text-slate-950 font-bold">Cleaning Frequency Guide</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-calendar-check"></i>
              <span>Maintenance Schedule Guide</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              How Often Does a Grease Trap Really Need to Be Cleaned?
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              The 25% rule, a frequency chart by trap size, and why Los Angeles summers change the equation.
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
                <i className="fas fa-gauge-high"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The 25% rule — what it actually means</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Under LACDPH regulations, a grease trap must be serviced before the combined depth of the FOG cap
                and bottom sludge layer reaches <strong>25% of the trap's total liquid capacity.</strong> This is
                not a recommendation — it is a compliance threshold.
              </p>
              <p>
                In practical terms: if your trap holds 500 gallons, you must service it before 125 gallons of
                accumulated FOG and sludge have built up. At that point the separation efficiency drops significantly,
                and grease begins bypassing the baffle and entering the city sewer.
              </p>
              <p>
                LACDPH inspectors carry measuring equipment. They can open your trap during a routine inspection
                and record the depth on the spot. If you are over 25% and have no recent service record, that is
                a violation — regardless of whether the trap has visibly overflowed.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-table-list"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Frequency by trap size and kitchen type</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              These intervals are starting points. Your actual frequency depends on menu type, shift volume, and
              seasonal factors. Use this table to establish a baseline, then adjust after your first two or three
              services based on how full the trap is at service time. For detailed frequency recommendations by kitchen type and Los Angeles seasonal factors, see our <Link to="/restaurant-grease-trap-cleaning-frequency-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">restaurant grease trap frequency guide</Link>.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm mt-2">
                <thead>
                  <tr className="bg-slate-950 text-white rounded-xl overflow-hidden">
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider rounded-l-2xl">Trap Size</th>
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider">Typical Setup</th>
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider">Service Interval</th>
                    <th className="text-left px-5 py-4 font-black text-[11px] uppercase tracking-wider rounded-r-2xl">Common Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {frequencyRows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-5 py-4 font-black text-slate-950">{row.size}</td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{row.type}</td>
                      <td className="px-5 py-4 font-black text-amber-700">{row.interval}</td>
                      <td className="px-5 py-4 text-slate-500 font-medium text-xs">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-sun"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The LA summer factor</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Los Angeles temperatures regularly exceed 95°F from June through September — and valley areas like
                the San Fernando Valley, where many restaurant corridors are concentrated, can hit 105°F or more.
                Heat accelerates bacterial activity inside the trap, which breaks down FOG faster and produces hydrogen
                sulfide gas more aggressively. The result: traps that take six weeks to hit 25% capacity in January
                may hit the same threshold in four weeks in July.
              </p>
              <p>
                If your kitchen runs at high volume during summer events, outdoor dining season, or holiday catering
                peaks, plan to shorten your service interval from May through October. This is one of the most common
                reasons we see unexpected overflows from kitchens that were otherwise well-managed.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-bowl-food"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">How your menu affects accumulation rate</h2>
            </div>
            <div className="pl-14 space-y-4">
              {menuFactors.map((mf, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <i className={`fas ${mf.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{mf.label}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-0.5">{mf.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-siren-on"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Scheduled service vs. emergency — the real cost difference</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Emergency grease trap service — triggered by an overflow, a slow drain, or an inspector on-site —
                typically runs <strong>50% to 100% more</strong> than a pre-scheduled visit. That is before factoring
                in potential overtime rates, same-day dispatch fees, and any compliance penalties assessed.
              </p>
              <p>
                Beyond the cost, an emergency call usually means your kitchen is already partially offline.
                A restaurant that loses two hours of service on a Friday night because of a grease trap overflow is
                losing far more than the cost of the call — and that loss does not show up on the service invoice.
              </p>
              <p>
                Setting a predictable service calendar based on your trap size and menu is the single most effective
                way to eliminate that risk. It also simplifies your budget: one fixed line item instead of unpredictable
                emergency expenses.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">Signs you may already be overdue</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  Slow drains in prep sinks, a sulfur or rotten-egg smell near floor drains, greasy film visible
                  in sink basins after draining, or a bubbling sound from drains under load. Any one of these is
                  a signal to schedule service immediately — before it becomes an overflow or an inspection finding.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Get on a maintenance schedule</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Tell us your trap size and volume — we will build a service calendar that keeps you compliant year-round.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=frequency-guide"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'grease_trap_cleaning_frequency', cta: 'get_estimate' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all whitespace-nowrap"
            >
              Build My Schedule
            </Link>
          </section>

        </div>
      </div>
    </>
  );
};

export default GreaseTrapCleaningFrequency;
