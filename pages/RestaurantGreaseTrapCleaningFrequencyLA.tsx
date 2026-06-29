import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How Often Should a Restaurant Clean Its Grease Trap in Los Angeles?',
  description:
    'Learn how often Los Angeles restaurants may need grease trap cleaning based on size, kitchen type, and FOG accumulation — plus how seasonal heat affects service intervals.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/restaurant-grease-trap-cleaning-frequency-los-angeles',
};

const RestaurantGreaseTrapCleaningFrequencyLA: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'restaurant_grease_trap_frequency_la' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'Grease Trap Cleaning Frequency Los Angeles',
      url: 'https://www.larestaurantservices.com/restaurant-grease-trap-cleaning-frequency-los-angeles',
    },
  ]);

  const frequencyGuide = [
    {
      icon: 'fa-utensils',
      title: 'Small trap (50–100 gallons)',
      detail:
        'Kitchens with light cooking volume or small food prep areas may need service every 2–4 weeks. This includes coffee shops with minimal cooking, juice bars, or sandwich shops.',
    },
    {
      icon: 'fa-fire-burner',
      title: 'Medium trap (250–750 gallons)',
      detail:
        'A typical full-service restaurant with moderate cooking volume often needs service every 4–8 weeks. High-fat menus (fried foods, carnitas, Korean BBQ) may require service every 3–4 weeks.',
    },
    {
      icon: 'fa-building',
      title: 'Large trap (1,000+ gallons)',
      detail:
        'High-volume restaurants, hotel kitchens, ghost kitchens, and commissaries with heavy FOG discharge may service every 8–12 weeks or longer, depending on actual discharge patterns.',
    },
  ];

  const warningFactors = [
    'Deep frying or oil-heavy cooking increases accumulation 3x–5x compared to light-prep kitchens',
    'Summer heat (June–October) accelerates bacterial activity and can shorten intervals by 2–3 weeks in Los Angeles',
    'Multiple dishwasher cycles per shift increase HOT water discharge and speed FOG emulsification',
    'Open-front griddles and wok stations with minimal capture hoods increase sink discharge volume',
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
            <span className="text-slate-950 font-bold">Grease Trap Cleaning Frequency</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-calendar-check"></i>
              <span>Maintenance Schedule Guide</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              How Often Should a Restaurant Clean Its Grease Trap in Los Angeles?
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              A practical frequency guide based on kitchen type, trap size, and Los Angeles seasonal factors.
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
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The direct answer</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Most Los Angeles restaurants <strong>may need grease trap service every 4–8 weeks</strong>, depending on kitchen volume, menu type, and trap size. Light-duty kitchens (cold prep, salads, sandwiches) often go longer. High-FOG operations (deep fryers, wok stations, charbroilers) often go shorter.
              </p>
              <p>
                Under LA County Department of Public Health rules, a trap must be serviced before accumulated FOG and sludge reach <strong>25% of the trap's total capacity.</strong> This is not a guideline — it is a compliance requirement that inspectors actively verify.
              </p>
              <p>
                The safest approach: have a service technician assess your trap during the first visit, note how full it is, and recommend a maintenance calendar based on your actual volume and discharge patterns.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-table-list"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Frequency by kitchen type</h2>
            </div>
            <div className="grid gap-5 pl-14">
              {frequencyGuide.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <i className={`fas ${item.icon} text-xs`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{item.title}</p>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed mt-1">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-sun"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Why frequency varies — and what to watch</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Grease trap accumulation is not linear. A kitchen that fills its trap to 25% capacity in eight weeks one season may fill it in four weeks during peak summer. This is because FOG discharge volume depends on menu type, kitchen heat, dishwasher load, and seasonal demand.
              </p>
              <p>
                Los Angeles summer temperatures (95°F–105°F+) accelerate bacterial breakdown and gas production inside the trap. More grease emulsifies and converts to sludge faster. The result: shorter intervals from May through October compared to winter months.
              </p>
            </div>
            <div className="pl-14 space-y-2 mt-4 border-l-4 border-amber-400 pl-4">
              <p className="font-black text-slate-950 text-sm">Factors that shorten your service intervals:</p>
              <ul className="text-slate-600 text-sm font-medium space-y-1">
                {warningFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-siren-on"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The hidden cost of waiting too long</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Scheduled maintenance saves money and downtime. Emergency service — triggered by a backup, slow drains, or an inspection finding — typically costs 50–100% more. But the real cost is operational: a kitchen offline during lunch or dinner service.
              </p>
              <p>
                A predictable maintenance calendar eliminates that risk. Set your service dates now, mark them on your calendar, and include them in your monthly budget. Your kitchen, your compliance record, and your bottom line will all thank you.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">When to request service sooner</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  Slow drains in prep sinks, rotten-egg smell near floor drains, gurgling sounds from drains under load, or visible grease film in sink basins. Any of these is a sign your trap has reached capacity before the scheduled service date.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Get on a maintenance schedule</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">We help Los Angeles restaurants set up predictable <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-400 hover:text-amber-300 transition-colors underline">grease trap cleaning</Link> calendars. Tell us your trap size and volume.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=restaurant-grease-trap-frequency"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'restaurant_grease_trap_frequency_la', cta: 'get_estimate' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all whitespace-nowrap"
            >
              Request Your Estimate
            </Link>
          </section>

        </div>
      </div>
    </>
  );
};

export default RestaurantGreaseTrapCleaningFrequencyLA;
