import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What Happens to FOG When It Enters the LA Sewer System',
  description:
    'What fats, oils, and grease do to the Los Angeles sewer system — from pipe blockages and fatbergs to Sanitary Sewer Overflows, beach closures, and the real cost of non-compliance.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/fats-oils-grease-sewer-impact-los-angeles',
};

const FOGSewerImpactLA: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'fog_sewer_impact_la' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'What Happens to FOG in the LA Sewer',
      url: 'https://www.larestaurantservices.com/fats-oils-grease-sewer-impact-los-angeles',
    },
  ]);

  const stats = [
    { value: '6,700+', label: 'miles of sewer pipe managed by LA Sanitation' },
    { value: '#1', label: 'cause of sanitary sewer overflows in LA County: FOG' },
    { value: '$500/day', label: 'civil penalty for non-compliant FSEs under LA FOG Program' },
    { value: '$50K+', label: 'potential liability if your FOG causes a sewer overflow event' },
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
            <span className="text-slate-950 font-bold">FOG in the LA Sewer System</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-water"></i>
              <span>Environmental Context</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              What Happens to FOG When It Enters the LA Sewer System
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              It is not just an inspection issue. Here is where the grease from your kitchen actually ends up — and why Los Angeles takes it seriously.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-xs">
                <i className="fas fa-hard-hat"></i>
              </div>
              <span className="text-sm font-bold text-slate-500">LA Restaurant Services · Field Technician Notes</span>
            </div>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center space-y-1">
                <p className="text-3xl font-black text-slate-950 tracking-tighter">{s.value}</p>
                <p className="text-[11px] text-slate-500 font-bold leading-snug">{s.label}</p>
              </div>
            ))}
          </div>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-circle-question"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What FOG actually is</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                FOG stands for Fats, Oils, and Grease. It is the collective term for all the lipid-based byproducts
                of commercial cooking — rendered animal fat from carnitas and BBQ, frying oil from fryers and
                deep-fry stations, butter and dairy residue from baking operations, and the emulsified fat that comes
                off dishes during washing.
              </p>
              <p>
                When it leaves your kitchen warm and liquid, it looks harmless. The problem begins about 50 to 100 feet
                downstream, once the temperature drops and the FOG starts to cool. At that point it transitions from
                liquid to semi-solid — and it sticks to whatever pipe wall it touches first.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-pipe-section"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What happens inside the pipe</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Once FOG coats a pipe wall, the buildup compounds over time. Each new wave of warm grease adds
                another thin layer on top of the existing deposit. Calcium compounds in the water bind with the fat
                molecules to form a harder, soap-like material that resists normal water flow. Left unchecked,
                this is how a 12-inch sewer lateral narrows to 4 inches over a few years — without a single sign
                visible at surface level.
              </p>
              <p>
                In severe cases, FOG accumulations from multiple upstream sources combine in main sewer trunks and
                form what engineers call <strong>fatbergs</strong> — masses of congealed grease, wet wipes, and debris
                that can grow to the size of a car or larger. The UK has had fatbergs weighing over 130 tons.
                Los Angeles, with one of the highest restaurant densities of any city in the United States, is not immune.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-burst"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Sanitary Sewer Overflows — and who pays</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                When a sewer pipe becomes fully blocked, sewage has nowhere to go but up. A Sanitary Sewer Overflow
                (SSO) can push untreated wastewater into streets, storm drains, and waterways. In Los Angeles,
                storm drains connect directly to the LA River and eventually to Santa Monica Bay — which is why
                a sewer overflow upstream can result in a beach closure at Santa Monica, Venice, or Malibu within
                24 to 48 hours.
              </p>
              <p>
                FOG from commercial kitchens is identified as <strong>the leading cause of SSOs in LA County.</strong>
                When an overflow occurs, LA Sanitation uses sampling and flow tracing to identify contributing FSEs
                in the upstream zone. If your facility is found to have been discharging FOG without a functioning
                interceptor — or with one that was not properly maintained — you can be held financially liable
                for cleanup and mitigation costs that can exceed $50,000 per event.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-file-shield"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">LA's FOG Control Program — what it requires of you</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                The <strong>City of Los Angeles Bureau of Sanitation</strong> operates a formal FOG Control Program
                that applies to all Food Service Establishments connecting to city sewer lines. The program has
                three core requirements:
              </p>
              <ul className="space-y-3 mt-2">
                {[
                  {
                    title: 'Install a properly sized interceptor',
                    detail: 'Sizing must comply with local plumbing code and be approved by the Bureau of Sanitation before final occupancy permit is issued.',
                  },
                  {
                    title: 'Maintain it under the 25% rule',
                    detail: 'Service the interceptor before the combined FOG and sludge layer reaches 25% of capacity. Service records must be retained for three years.',
                  },
                  {
                    title: 'Use a licensed waste hauler',
                    detail: 'The FOG waste must be transported by a California-licensed waste hauler to an approved disposal or rendering facility. The manifest is your proof.',
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <span className="font-black text-slate-950">{item.title}: </span>
                      <span>{item.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Non-compliant FSEs face civil penalties starting at <strong>$500 per day</strong> until the violation
                is corrected. Repeat violations or those that contribute to an SSO event carry significantly higher
                penalties and can result in permit suspension.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-recycle"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Where the FOG goes after collection</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                When FOG is properly collected by a licensed hauler, it does not go to a landfill. In California,
                most recovered FOG goes to one of two places:
              </p>
              <p>
                <strong>Rendering facilities</strong> process animal fat into usable byproducts — including tallow
                for industrial applications and biodiesel feedstock. <strong>Wastewater treatment plants</strong> in
                some cases accept FOG for anaerobic digestion, converting it into biogas that generates electricity
                on-site.
              </p>
              <p>
                Properly managed FOG is not waste — it is a recovered resource. That is why California invests
                in enforcement: keeping it out of the sewer system means it can be put to productive use instead
                of causing expensive infrastructure damage and environmental harm.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">This is why we always provide a waste manifest</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  Every service we perform includes a fully completed waste manifest with the licensed disposal facility
                  reference number. It is your documentation that the FOG from your kitchen was handled legally — and
                  it is the record that protects you if LA Sanitation ever audits the disposal chain in your service area.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Keep your kitchen out of the FOG report</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Scheduled service, proper documentation, licensed disposal — all in one place.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=fog-sewer-impact"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'fog_sewer_impact_la', cta: 'get_estimate' })}
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

export default FOGSewerImpactLA;
