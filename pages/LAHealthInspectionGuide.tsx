import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'LA Restaurant Health Inspections 101: What Inspectors Actually Check',
  description:
    'A plain-language breakdown of how LACDPH restaurant health inspections work, what gets you cited, how grease trap records factor into your score, and what triggers a re-inspection.',
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/la-restaurant-health-inspection-guide',
};

const LAHealthInspectionGuide: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'la_health_inspection_guide' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'LA Restaurant Health Inspection Guide',
      url: 'https://www.larestaurantservices.com/la-restaurant-health-inspection-guide',
    },
  ]);

  const gradeImpact = [
    {
      icon: 'fa-a',
      grade: 'A (90–100)',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      detail: 'Permitted to post the A grade placard at your entrance. This is the standard. Anything short of it is visible to every customer who walks in.',
    },
    {
      icon: 'fa-b',
      grade: 'B (80–89)',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      detail: 'Must be posted publicly. Customers notice. A B grade often comes from accumulation of minor violations — missed cleaning intervals, inadequate documentation — not just one big failure.',
    },
    {
      icon: 'fa-c',
      grade: 'C (70–79)',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      detail: 'Must be posted. Triggers a follow-up inspection within 14 days. Your establishment is now in active enforcement monitoring.',
    },
    {
      icon: 'fa-circle-xmark',
      grade: 'Below 70 / Closure',
      color: 'text-red-700 bg-red-50 border-red-200',
      detail: 'LACDPH can issue an immediate closure order. You cannot reopen until the inspector signs off on a re-inspection. No advance notice is required.',
    },
  ];

  const fogItems = [
    {
      item: 'Service records on file',
      weight: 'Up to 4 points deducted if missing',
      detail: "Inspectors ask for your last grease trap service receipt and waste manifest. If you can't produce them, that is a documented violation — regardless of whether the trap looks full.",
    },
    {
      item: 'FOG layer depth at or below 25%',
      weight: 'Up to 4 points deducted if over threshold',
      detail: 'Inspectors carry depth-measurement tools. If your trap is over the 25% threshold, the violation is recorded on the spot. Being close to the threshold is not a defense.',
    },
    {
      item: 'Grease trap lid accessible and secured',
      weight: '1–2 points',
      detail: 'A lid buried under equipment, a lid with a broken gasket, or a lid that has been sealed with caulk instead of a proper gasket are all citable conditions.',
    },
    {
      item: 'No visible grease backup or overflow evidence',
      weight: 'Up to 7 points (major violation)',
      detail: 'Grease residue around the trap lid, on the floor nearby, or in floor drains indicates an overflow has occurred. This is a major violation that can force an immediate re-inspection.',
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
            <span className="text-slate-950 font-bold">Health Inspection Guide</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-clipboard-check"></i>
              <span>Regulations for Dummies</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              LA Restaurant Health Inspections 101: What Inspectors Actually Check
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              No jargon. Just what the LACDPH inspector is looking for when they walk into your kitchen — and where grease traps fit into your score.
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
                <i className="fas fa-user-check"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Who is doing the inspecting</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                In Los Angeles County, restaurant health inspections are conducted by
                <strong> Environmental Health Specialists (EHS)</strong> employed by the
                <strong> LA County Department of Public Health (LACDPH)</strong> — specifically its
                Environmental Health division. These are trained inspectors, not generalists. They know exactly
                what they are looking for, and they have seen every excuse in the book.
              </p>
              <p>
                Inspections are <strong>unannounced</strong>. You do not get a 48-hour notice. The inspector
                can show up on your busiest lunch service or on a quiet Tuesday morning. The condition of your
                kitchen on that specific day determines your score — not how clean it was the week before.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-star"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">How the grading system works</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                LA County uses a <strong>100-point scoring system.</strong> Each violation deducts points based
                on severity. Major violations (directly related to public health risk) deduct 4–7 points each.
                Minor violations deduct 1–2 points. The score at the end of the inspection determines your
                letter grade, which must be posted visibly at your entrance.
              </p>
            </div>
            <div className="pl-14 grid gap-3 mt-2">
              {gradeImpact.map((g, idx) => (
                <div key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border ${g.color}`}>
                  <span className="font-black text-lg w-24 shrink-0">{g.grade}</span>
                  <p className="text-sm font-medium leading-relaxed">{g.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-droplet"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Exactly how your grease trap affects your score</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              Grease trap compliance is evaluated as part of the <strong>facility maintenance and equipment</strong> section of the inspection form. Here is what gets checked and what it costs you if it is wrong:
            </p>
            <div className="pl-14 space-y-4">
              {fogItems.map((fi, idx) => (
                <div key={idx} className="border border-slate-100 rounded-2xl p-5 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-black text-slate-950 text-sm">{fi.item}</p>
                    <span className="text-[11px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">{fi.weight}</span>
                  </div>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">{fi.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-rotate-right"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What triggers a re-inspection — and what it costs</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Any score below 90 automatically places your facility in a follow-up cycle. A B grade (80–89)
                typically results in a re-inspection within <strong>30 to 60 days.</strong> A C grade triggers
                a re-inspection within <strong>14 days.</strong> A closure order requires the inspector to
                return and physically verify corrections before you reopen — sometimes the same day, sometimes
                the next morning.
              </p>
              <p>
                Re-inspections are not free. LACDPH charges a re-inspection fee currently set at
                <strong> $185–$245 per visit</strong>, depending on your permit tier. A single failed inspection
                can cascade into two or three follow-up visits before the record is cleared — adding up to
                several hundred dollars in fees on top of any civil penalties assessed.
              </p>
              <p>
                The fastest path to a re-inspection is a grease trap violation — specifically, being over the
                25% FOG threshold or having no service records. It is also one of the most preventable.
                A predictable service schedule eliminates both risks in a single step.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-folder-open"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">The one thing that takes 10 minutes to fix in advance</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Before any inspection — announced or not — you should be able to put your hands on your last
                grease trap service manifest and receipt in under 60 seconds. That is it. That single document
                answers three of the most common grease-related inspection questions simultaneously: Was the trap
                serviced? When? Where did the waste go?
              </p>
              <p>
                Keep a physical folder in your office and a digital backup. Date-name the files so you can sort
                by service date instantly. Every time we complete a service, we hand you the manifest before
                the truck leaves. Your only job is to file it.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">LA County inspection reports are public record</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  Every inspection report for every permitted restaurant in LA County is searchable online through
                  the LACDPH Restaurant and Market Inspection database. Your customers can look up your history.
                  So can your landlord, your investors, and journalists. A consistent A grade is the simplest
                  public-facing signal of a well-run operation.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Stay inspection-ready year-round</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Scheduled service, documentation on every visit, and no surprises when the inspector walks in.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=health-inspection-guide"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'la_health_inspection_guide', cta: 'get_estimate' })}
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

export default LAHealthInspectionGuide;
