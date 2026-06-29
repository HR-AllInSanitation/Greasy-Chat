import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How a Grease Trap Actually Works',
  description:
    'A plain explanation of grease trap anatomy, how FOG accumulates, and what happens when the trap reaches capacity — from a technician who services them daily in Los Angeles.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/how-a-grease-trap-works',
};

const HowGreaseTrapWorks: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'how_grease_trap_works' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    { name: 'How a Grease Trap Works', url: 'https://www.larestaurantservices.com/how-a-grease-trap-works' },
  ]);

  const sections = [
    {
      icon: 'fa-droplet',
      heading: 'The simple version',
      body: `A grease trap is a holding box installed between your kitchen drains and the city sewer line. Its only job is to slow down the water long enough for grease to float to the top and food solids to sink to the bottom — so that neither one makes it into the public sewer system. That's it. The science is straightforward; the problems start when it fills up and nobody cleans it.`,
    },
    {
      icon: 'fa-layer-group',
      heading: "What's inside: three distinct layers",
      body: `Every time water drains from your sinks, pots, and dishwasher, it enters the trap as a warm mixture of grease, food particles, and water. Inside the trap those three materials separate by density:\n\n• **Top layer — FOG (Fats, Oils, Grease):** Grease is lighter than water, so it rises and stays near the surface. As it cools it solidifies into a semi-solid cap.\n\n• **Middle layer — Effluent water:** The relatively clean water in the middle slowly passes through and continues to the sewer outlet.\n\n• **Bottom layer — Food solids:** Heavier particles — rice, meat scraps, breading — sink and accumulate as a sludge layer on the floor of the trap.\n\nBetween the two main compartments sits a baffle wall (a divider with an opening below the waterline). Water has to travel under the baffle to exit, which forces it away from the grease cap on top.`,
    },
    {
      icon: 'fa-cubes-stacked',
      heading: 'Under-sink traps vs. outdoor interceptors',
      body: `There are two common configurations in Los Angeles kitchens:\n\n**Under-sink (interior) grease traps** — These are compact units, typically 10 to 50 gallons, installed directly under a prep sink or dishwasher. They fill fast. A busy taqueria or sandwich shop might need service every one to two weeks. They're easier to access but easier to ignore, which is where most violations start.\n\n**Outdoor grease interceptors** — These are larger in-ground tanks, commonly 500 to 2,000+ gallons, installed outside in a parking lot or alley. They're mandated by LA County for most full-service restaurants and high-volume operations. Because they hold more, they tolerate longer service intervals — but they also cause much bigger problems when they overflow.\n\nNot sure which one you have or the difference between a trap and an interceptor? [LINK_GREASE_TRAP_VS_INTERCEPTOR]`,
      needsLink: true,
    },
    {
      icon: 'fa-chart-line',
      heading: 'How the trap fills up over time',
      body: `Every shift, a small amount of FOG gets added on top of the existing cap. Food solids keep piling on the bottom. The middle layer of clean water gets narrower and narrower. Once the FOG layer reaches roughly 25% of the trap's total depth, the separation process starts to break down — grease starts riding out with the effluent water and entering the sewer line.\n\nThis is where the LA County Health Department's "25% rule" comes from. It's not an arbitrary threshold — it's the point where the trap stops doing its job and starts becoming a liability.`,
    },
    {
      icon: 'fa-triangle-exclamation',
      heading: "What happens when it's full",
      body: `A full grease trap doesn't explode or make noise. The warning signs are subtle at first: drains slow down, a faint sulfur smell develops (hydrogen sulfide from anaerobic bacteria digesting the sludge), and eventually you start seeing greasy film in your sinks. By the time the smell is noticeable to customers, you're already overdue.\n\nWorse, if the trap overflows or FOG bypasses the unit, it enters the city sewer and begins solidifying on pipe walls downstream. That's your problem now — and potentially your liability, since LA Sanitation can trace FOG blockages back to the source establishment.`,
    },
    {
      icon: 'fa-wrench',
      heading: 'What a proper cleaning restores',
      body: `When we service a grease trap, we pump out all three layers — not just the top FOG cap. That means vacuuming the sludge from the bottom, scraping the baffle walls, and doing a visual inspection of the baffles and lid gaskets before we close it back up. After service, the trap is back to near-full capacity and doing its job again. We document the gallons extracted and issue a waste manifest — both required by LACDPH for compliance.`,
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
            <span className="text-slate-950 font-bold">How a Grease Trap Works</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-graduation-cap"></i>
              <span>Technician's Guide</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              How a Grease Trap Actually Works
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              A plain explanation from someone who opens these every day across Los Angeles — no jargon, just the mechanics you need to understand.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-xs">
                <i className="fas fa-hard-hat"></i>
              </div>
              <span className="text-sm font-bold text-slate-500">LA Restaurant Services · Field Technician Notes</span>
            </div>
          </header>

          <div className="space-y-8">
            {sections.map((section, idx) => (
              <article key={idx} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                    <i className={`fas ${section.icon}`}></i>
                  </div>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight">{section.heading}</h2>
                </div>
                <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line pl-14">
                  {section.body.split('\n').map((line, i) => {
                    // Handle special markdown link for grease-trap-vs-grease-interceptor
                    let content = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    if (line.includes('[LINK_GREASE_TRAP_VS_INTERCEPTOR]')) {
                      return (
                        <p key={i} className="mt-2">
                          Not sure which one you have or the difference between a trap and an interceptor? <Link to="/grease-trap-vs-grease-interceptor-los-angeles" className="text-amber-700 hover:text-amber-800 font-semibold transition-colors">Read our comprehensive comparison</Link>.
                        </p>
                      );
                    }
                    return (
                      <p
                        key={i}
                        className={line.startsWith('•') ? 'ml-2 mt-1' : line.startsWith('**') ? 'mt-3' : 'mt-2 first:mt-0'}
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">LA County Compliance Note</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  LACDPH requires grease traps to be serviced before the FOG layer reaches 25% of the trap's total capacity.
                  Inspectors can and do measure this on-site. The waste manifest from each service is your paper trail.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Ready to schedule service?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Get an accurate estimate for your trap size in under 2 minutes.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=how-grease-trap-works"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'how_grease_trap_works', cta: 'get_estimate' })}
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

export default HowGreaseTrapWorks;
