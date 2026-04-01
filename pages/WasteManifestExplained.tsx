import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Your Grease Trap Waste Manifest Explained Line by Line',
  description:
    "What every field on a grease trap waste manifest means, why it is a legal document under California law, and what happens if it is missing during an LACDPH or LASAN inspection.",
  author: { '@type': 'Organization', name: 'LA Restaurant Services' },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: { '@type': 'ImageObject', url: 'https://www.larestaurantservices.com/brand-hero.svg' },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/grease-trap-waste-manifest-explained',
};

const WasteManifestExplained: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'waste_manifest_explained' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Resources', url: 'https://www.larestaurantservices.com/best-practices' },
    {
      name: 'Waste Manifest Explained',
      url: 'https://www.larestaurantservices.com/grease-trap-waste-manifest-explained',
    },
  ]);

  const fields = [
    {
      field: 'Generator information',
      plain: 'That is you — your business name, address, and contact. This establishes who produced the FOG waste. You are legally the "generator" under California hazardous materials transport law, even though you are not moving the waste yourself.',
    },
    {
      field: 'Transporter / hauler information',
      plain: "The licensed waste hauler's name, California EPA ID number, and vehicle license plate. This field is how regulators verify that the person carrying your waste is legally permitted to do so. An unlicensed hauler on your manifest is a violation even if everything else is correct.",
    },
    {
      field: 'Waste description and volume',
      plain: 'Typically listed as "Non-hazardous grease waste / FOG" with total gallons pumped. This is the field inspectors use to verify the service was appropriate for your trap size. If you have a 500-gallon interceptor and the manifest shows 20 gallons removed, expect questions.',
    },
    {
      field: 'Date of service',
      plain: 'The date the pumping occurred — not the date the form was filled out. This is how inspectors calculate whether your service interval complied with the 25% rule based on your previous manifest.',
    },
    {
      field: 'Disposal facility name and address',
      plain: 'Where the FOG waste went after leaving your property. This must be an approved California facility — a licensed rendering plant, approved grease recycler, or wastewater treatment plant that accepts FOG. This field is auditable: regulators can and do contact facilities to confirm receipt.',
    },
    {
      field: 'Generator signature',
      plain: 'Your signature (or an authorized representative of your business) confirms you are acknowledging the waste was removed from your property. Signing an incomplete or inaccurate manifest creates personal liability.',
    },
    {
      field: 'Hauler signature',
      plain: "The transporter's signature confirms they received the waste and accept transport responsibility. Both signatures must be present for the manifest to be valid. A manifest signed only by one party is incomplete.",
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
            <span className="text-slate-950 font-bold">Waste Manifest Explained</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-file-contract"></i>
              <span>Regulations for Dummies</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-950 leading-tight tracking-tighter">
              Your Grease Trap Waste Manifest Explained Line by Line
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
              That form your service technician hands you at the end of every job is a legal document. Here is what every field means and why it matters.
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
                <i className="fas fa-gavel"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Why the manifest is a legal document</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                Grease trap waste — classified as <strong>non-hazardous liquid waste</strong> in California — is
                subject to the California Health and Safety Code, specifically the requirements governing the
                transport and disposal of non-hazardous waste by registered waste haulers. The manifest is the
                paper trail that proves every link in that chain was handled legally.
              </p>
              <p>
                As the generator, you are legally responsible for ensuring the waste from your facility was
                transported and disposed of in compliance with state law — even after it leaves your property.
                If a hauler illegally dumps your grease waste and you have no manifest on file, you can be held
                jointly liable. The manifest is your only protection against that outcome.
              </p>
              <p>
                California law requires generators to retain waste manifests for a minimum of
                <strong> three years</strong> and to produce them on request by any authorized inspector.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-magnifying-glass-plus"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">Every field, in plain language</h2>
            </div>
            <p className="pl-14 text-slate-600 font-medium leading-relaxed">
              A standard California grease waste manifest contains these core fields. Here is what each one means and why it cannot be left blank:
            </p>
            <div className="pl-14 space-y-4">
              {fields.map((f, idx) => (
                <div key={idx} className="border-l-4 border-amber-400 pl-5 space-y-1">
                  <p className="font-black text-slate-950 text-sm">{f.field}</p>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">{f.plain}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">What happens if you cannot produce it</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                If an LACDPH inspector asks for your waste manifest during a health inspection and you cannot
                produce it, that is a violation on the spot — regardless of whether the trap was actually serviced.
                The inspection report will document it, points will be deducted, and you will be given a deadline
                to produce the records. If you genuinely do not have them, you have a problem.
              </p>
              <p>
                During an LASAN FOG compliance audit, missing manifests are the primary basis for enforcement
                action. An audit that finds no manifests on file for 12 months will result in a Notice of
                Violation and may trigger a full compliance investigation, including on-site measurement of
                your interceptor and review of your service history.
              </p>
              <p>
                Some contractors promise service and never provide a manifest. If that describes your current
                provider, ask them directly. If they cannot produce the manifests retroactively, switch providers —
                and start fresh with a documented service date going forward.
              </p>
            </div>
          </article>

          <article className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                <i className="fas fa-folder-open"></i>
              </div>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">How to store and retrieve them quickly</h2>
            </div>
            <div className="pl-14 text-slate-600 font-medium leading-relaxed space-y-3">
              <p>
                The best system is the simplest one you will actually use. One physical binder labeled
                "Grease Trap Records" near your office filing cabinet, with manifests sorted in reverse
                chronological order (newest on top). One digital folder in your email or cloud storage with
                files named in the format <strong>YYYY-MM-DD_grease-manifest.pdf</strong>.
              </p>
              <p>
                When an inspector asks, you should be able to hand them the last three manifests in under
                a minute. That level of organization signals an operation that takes compliance seriously —
                and it often influences how closely an inspector scrutinizes everything else.
              </p>
            </div>
          </article>

          <aside className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-info text-amber-600 mt-1"></i>
              <div>
                <p className="font-black text-slate-950 text-sm">We provide the manifest before the truck leaves your property</p>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mt-1">
                  Every service we complete includes a fully signed waste manifest with the licensed disposal
                  facility reference. You do not have to chase us for documentation — it comes with the job.
                  If your current provider is making you follow up to get your compliance paperwork, that is
                  not a paperwork problem. That is a provider problem.
                </p>
              </div>
            </div>
          </aside>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Service with documentation included</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">Every job comes with a complete manifest, service receipt, and compliance log entry.</p>
            </div>
            <Link
              to="/instant-estimate?service=grease-trap-interceptor&source=manifest-explained"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'waste_manifest_explained', cta: 'get_estimate' })}
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

export default WasteManifestExplained;
