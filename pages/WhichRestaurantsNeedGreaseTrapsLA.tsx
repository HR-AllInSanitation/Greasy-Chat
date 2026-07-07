import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Which LA Restaurants Need Grease Traps? Requirements & Service Help',
  description:
    'General guidance on which Los Angeles restaurants, cafes, ghost kitchens, and commercial kitchens may need grease traps or interceptors, plus when to request service.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/which-restaurants-need-grease-traps-los-angeles',
};

const WhichRestaurantsNeedGreaseTrapsLA: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'which_restaurants_need_grease_traps' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'Which Kitchens Need a Grease Trap in LA',
      url: 'https://www.larestaurantservices.com/which-restaurants-need-grease-traps-los-angeles',
    },
  ]);

  const categories = [
    {
      icon: 'fa-utensils',
      label: 'Commonly Required',
      labelColor: 'text-red-600 bg-red-50 border-red-100',
      title: 'Full-service restaurants',
      detail:
        'Restaurants that cook food and discharge wash water into the sanitary sewer commonly need grease management equipment. This often includes sit-down restaurants, quick-service locations, bars with kitchens, and hotel dining operations.',
    },
    {
      icon: 'fa-school',
      label: 'Commonly Required',
      labelColor: 'text-red-600 bg-red-50 border-red-100',
      title: 'School cafeterias and institutional kitchens',
      detail:
        'K-12 schools, college dining halls, hospital cafeterias, and similar institutional kitchens are commonly treated as food service operations that need properly sized grease control systems.',
    },
    {
      icon: 'fa-truck',
      label: 'Via Commissary',
      labelColor: 'text-amber-700 bg-amber-50 border-amber-100',
      title: 'Food trucks and mobile vendors',
      detail:
        'Food trucks do not usually connect directly to sewer lines, but they often rely on commissaries that may need compliant grease management systems. It is best to verify your commissary setup with your local authority.',
    },
    {
      icon: 'fa-warehouse',
      label: 'Commonly Required',
      labelColor: 'text-red-600 bg-red-50 border-red-100',
      title: 'Ghost kitchens and delivery-only operations',
      detail:
        'Ghost kitchens and delivery-only operations can produce the same FOG load as traditional restaurants, so they may need grease traps or interceptors based on kitchen activity and plumbing setup.',
    },
    {
      icon: 'fa-building',
      label: 'Commonly Required',
      labelColor: 'text-red-600 bg-red-50 border-red-100',
      title: 'Catering companies with commissary kitchens',
      detail:
        'Catering operations that prep at fixed facilities or commissaries may need grease control equipment depending on discharge points and local requirements.',
    },
    {
      icon: 'fa-mug-hot',
      label: 'Verify with LACDPH',
      labelColor: 'text-slate-600 bg-slate-100 border-slate-200',
      title: 'Coffee shops and juice bars',
      detail:
        'Some low-FOG concepts may have different requirements, while locations with food prep or blending may still need grease control. Confirm your specific setup with your local Environmental Health district office.',
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
            <span className="text-slate-950 font-bold">Which Kitchens Need a Grease Trap</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-scale-balanced"></i>
              <span>General Guidance</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              Which Restaurants in Los Angeles Need a Grease Trap?
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              Restaurants and commercial kitchens that generate fats, oils, and grease (FOG) may need a grease trap or grease interceptor depending on local requirements, kitchen fixtures, and sewer connection setup.
            </p>
            <p className="text-sm text-slate-500 font-medium max-w-3xl">
              This page is for general informational purposes and is not legal or official compliance advice.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-xs">
                <i className="fas fa-hard-hat"></i>
              </div>
              <span className="text-sm font-bold text-slate-500">LA Restaurant Services · Field Technician Notes</span>
            </div>
            <p className="text-sm text-slate-600 font-medium mt-2">Not sure about your service schedule? See <Link to="/restaurant-grease-trap-cleaning-frequency-los-angeles" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">how often grease trap service is required</Link> based on your kitchen type.</p>
          </header>

          <section className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">Need grease trap cleaning or interceptor pumping in Los Angeles?</h2>
              <p className="text-slate-600 font-medium mt-1">Request service from LA Restaurant Services.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=which-restaurants-top-cta"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'which_restaurants_need_grease_traps', cta: 'top_request_service' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all whitespace-nowrap"
            >
              Request Service
            </Link>
          </section>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-book"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Direct answer</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Many Los Angeles food operations that prepare food and discharge to the sanitary sewer may need grease traps
                or interceptors. In practice, this often includes restaurants, commercial kitchens, cafes, bars, hotels,
                ghost kitchens, and shared kitchen facilities.
              </p>
              <p>
                Final requirements depend on your kitchen setup, fixture counts, and local agency interpretation. Confirm
                your classification with your district office, then align service scheduling to protect operations.
              </p>
            </div>
          </article>

          <article className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <p className="text-slate-700 font-medium leading-relaxed">
              Need help translating requirements into a service plan? LA Restaurant Services provides <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease trap cleaning</Link>, <Link to="/grease-trap-interceptor-pumping" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease interceptor pumping</Link>, and <Link to="/restaurant-waste-services" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">restaurant waste services</Link> for commercial kitchens across Los Angeles and Southern California. (Not sure about the difference between a trap and an interceptor? <Link to="/grease-trap-vs-grease-interceptor-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">Read our guide</Link>.) Want to know <Link to="/la-fog-program-explained" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">LA FOG program requirements</Link>? See our compliance overview.
            </p>
          </article>

          <div className="space-y-5">
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Who may need a grease trap</h2>
            <div className="grid gap-5">
              {categories.map((cat, idx) => (
                <article key={idx} className="bg-white border border-slate-100 rounded-3xl p-7 shadow-sm space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <i className={`fas ${cat.icon}`}></i>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-black text-slate-950 tracking-tight">{cat.title}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${cat.labelColor}`}>
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">{cat.detail}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Signs your grease trap needs service</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>Watch for operational signs that service may be due:</p>
              <p className="text-sm pt-2">If you're experiencing recurring backups or slow drains, learn <Link to="/why-restaurant-kitchen-drains-back-up-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">what happens when service is skipped</Link> and how often you may need scheduled maintenance.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Recurring slow drains in prep sinks or dish areas.</li>
                <li>Persistent kitchen drain odor during or after busy shifts.</li>
                <li>Frequent backups that return after temporary fixes.</li>
                <li>More emergency calls between scheduled pumping visits.</li>
              </ul>
              <p>
                If backups are recurring, pair <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease trap cleaning</Link> with
                <Link to="/hydro-jetting-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors"> commercial hydro jetting</Link> to clear downstream buildup.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-code-compare"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Grease trap vs interceptor</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Smaller indoor systems are often called grease traps, while larger exterior systems are commonly referred to as interceptors. Both are built to capture FOG before it reaches sewer lines.
              </p>
              <p>
                If you are unsure which system applies to your site, compare options in our
                <Link to="/grease-trap-vs-grease-interceptor-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors"> grease trap vs interceptor guide</Link>, then request
                <Link to="/grease-trap-interceptor-pumping" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors"> interceptor pumping service</Link> for your kitchen profile.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Why cleaning schedules matter</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Consistent scheduling helps reduce emergency downtime, protects kitchen throughput, and keeps service records organized for internal operations.
              </p>
              <p>
                Teams managing multiple vendors can simplify planning by coordinating through
                <Link to="/restaurant-waste-services" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors"> restaurant waste services</Link> with aligned maintenance windows.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-bell"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">When to request service</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>Request service when you are onboarding a new kitchen, seeing repeat drain issues, or adjusting maintenance frequency after volume changes.</p>
              <p>
                For active issues, request <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease trap cleaning</Link> or
                <Link to="/grease-trap-interceptor-pumping" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors"> interceptor pumping</Link> with your site details.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What information to provide for a quote</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>To get a faster quote, prepare:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Business name and service address.</li>
                <li>Kitchen type and operating volume.</li>
                <li>Current system type (trap or interceptor) and known size.</li>
                <li>Service history, current issue, and preferred schedule window.</li>
              </ul>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-hammer"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">New construction and kitchen renovations</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Any new construction permit for a commercial kitchen automatically triggers the grease interceptor
                requirement. If you are renovating an existing space and the work touches plumbing, the permit review
                process will typically require you to bring the interceptor up to current code sizing standards — even
                if the original kitchen had a small under-sink trap that was grandfathered in.
              </p>
              <p>
                Sizing matters. LACDPH and the local sanitation district use a formula based on your kitchen's fixture
                units, cooking equipment, and estimated dishwasher throughput to determine the minimum interceptor
                capacity. Undersized interceptors do not pass inspection and will not protect you from enforcement.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">When in doubt, call your district office</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  LACDPH Environmental Health operates district offices across the county. If your operation is borderline
                  — such as a ghost kitchen, shared commissary, or food-adjacent business — confirm how your site is
                  classified and what equipment is expected.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Need grease trap cleaning or interceptor pumping in Los Angeles?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Request service from LA Restaurant Services.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=which-restaurants-need-traps"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'which_restaurants_need_grease_traps', cta: 'get_estimate' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all whitespace-nowrap"
            >
              Request Service
            </Link>
          </section>

        </div>
      </div>
    </>
  );
};

export default WhichRestaurantsNeedGreaseTrapsLA;
