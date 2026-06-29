import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Which Kitchens Are Required to Have a Grease Trap in LA',
  description:
    'How LA County Environmental Health classifies Food Service Establishments and which kitchens are legally required to have grease interceptors — including food trucks, ghost kitchens, and commissaries.',
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
      label: 'Required',
      labelColor: 'text-red-600 bg-red-50 border-red-100',
      title: 'Full-service restaurants',
      detail:
        'Any restaurant cooking food and discharging wash water into the sanitary sewer is required to have a grease interceptor. This covers the vast majority of sit-down restaurants, fast food locations, bars with kitchens, and hotel dining operations throughout LA County.',
    },
    {
      icon: 'fa-school',
      label: 'Required',
      labelColor: 'text-red-600 bg-red-50 border-red-100',
      title: 'School cafeterias and institutional kitchens',
      detail:
        'K-12 schools, college dining halls, hospital cafeterias, and correctional facility kitchens all fall under LACDPH Food Service Establishment (FSE) classification. If a kitchen cooks food and discharges to the city sewer, it needs a properly sized interceptor.',
    },
    {
      icon: 'fa-truck',
      label: 'Via Commissary',
      labelColor: 'text-amber-700 bg-amber-50 border-amber-100',
      title: 'Food trucks and mobile vendors',
      detail:
        'Food trucks themselves don\'t connect to a sewer line, but they\'re required to operate out of a licensed commissary — and that commissary must have a functioning grease interceptor. If your commissary is non-compliant, your truck\'s health permit is at risk. Verify your commissary\'s compliance status before you rely on it.',
    },
    {
      icon: 'fa-warehouse',
      label: 'Required',
      labelColor: 'text-red-600 bg-red-50 border-red-100',
      title: 'Ghost kitchens and delivery-only operations',
      detail:
        'Ghost kitchens operate at full commercial cooking volume and discharge just as much FOG as a traditional restaurant. The fact that you have no dining room does not exempt you. LACDPH classifies them the same way — based on cooking activity and sewer discharge, not customer seating.',
    },
    {
      icon: 'fa-building',
      label: 'Required',
      labelColor: 'text-red-600 bg-red-50 border-red-100',
      title: 'Catering companies with commissary kitchens',
      detail:
        'Catering operations preparing food at a fixed facility are FSEs and must maintain grease interceptors. This includes caterers who prep at their own space and rent commissary kitchens for overflow. Whoever owns the discharge point is responsible for the interceptor.',
    },
    {
      icon: 'fa-mug-hot',
      label: 'Verify with LACDPH',
      labelColor: 'text-slate-600 bg-slate-100 border-slate-200',
      title: 'Coffee shops and juice bars',
      detail:
        'A pure espresso bar with no cooking activity may qualify for an exemption or a reduced interceptor requirement under LACDPH guidelines — but this is determined case by case. If you also serve food, do any light cooking, or operate a blending station, you likely need a trap. Do not assume you are exempt. Confirm directly with your local Environmental Health district office.',
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
              <span>LA County Compliance</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              Which Restaurants in Los Angeles Need a Grease Trap?
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              More operations than you would expect — here is how LACDPH classifies your kitchen and what the law actually requires.
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
                <i className="fas fa-book"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The governing rule</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                In Los Angeles County, the requirement comes from two overlapping authorities: the
                <strong> LA County Department of Public Health (LACDPH)</strong> Environmental Health division and the
                <strong> LA Sanitation FOG (Fats, Oils, Grease) Control Program</strong>. Together they mandate that all
                Food Service Establishments — any facility that prepares or serves food for public consumption and connects
                to the sanitary sewer — must install, maintain, and regularly service a grease interceptor.
              </p>
              <p>
                The key phrase is <strong>"discharges to the sanitary sewer."</strong> If your facility has a sewer
                connection and cooks food, you are presumed to need an interceptor unless you can demonstrate to LACDPH
                that your discharge does not contain FOG at actionable levels. That is a narrow exception, and it requires
                formal approval — not a judgment call on your part.
              </p>
            </div>
          </article>

          <article className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <p className="text-slate-700 font-medium leading-relaxed">
              Need help confirming grease trap service for a Los Angeles restaurant? LA Restaurant Services provides <Link to="/grease-trap-cleaning-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">grease trap cleaning</Link> and grease interceptor pumping, plus <Link to="/restaurant-waste-services" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">restaurant waste support</Link> for commercial kitchens across Los Angeles and Southern California.
            </p>
          </article>

          <div className="space-y-5">
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">By operation type</h2>
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
                  — a ghost kitchen, a shared commissary, a food-adjacent business — call your district office directly
                  and ask how they classify your FSE type. Getting it in writing is even better. A 10-minute phone call
                  is cheaper than a shutdown.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Need a compliant service provider?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">We handle manifests, compliance documentation, and scheduling across all LA County districts.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=which-restaurants-need-traps"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'which_restaurants_need_grease_traps', cta: 'get_estimate' })}
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

export default WhichRestaurantsNeedGreaseTrapsLA;
