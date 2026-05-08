import React from 'react';
import { Link } from 'react-router-dom';
import { StructuredData, buildBreadcrumbSchema, buildFAQPageSchema, buildServiceSchema } from '../components/StructuredData';
import { getEstimatorServiceByKey } from '../data/serviceOptions';
import {
  buildLeadPayload,
  createManualReviewEstimate,
  defaultEstimateContactValues,
  defaultEstimateFormValues,
  hasMinPhoneDigits,
  isValidEmail,
  submitLeadPayload,
} from '../utils/estimateFlow';
import { Frequency } from '../types';

const GoslynInstallationLA: React.FC = () => {
  const goslynService = getEstimatorServiceByKey('goslyn-consultation');

  const [businessName, setBusinessName] = React.useState('');
  const [pumpingFrequency, setPumpingFrequency] = React.useState<'Monthly' | 'Quarterly'>('Monthly');
  const [sinkCount, setSinkCount] = React.useState('1');
  const [cityNotice, setCityNotice] = React.useState<'Yes' | 'No'>('No');
  const [monthlyPumpingCost, setMonthlyPumpingCost] = React.useState('');
  const [contactName, setContactName] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [preferredContact, setPreferredContact] = React.useState<'either' | 'phone' | 'email'>('either');
  const [submitError, setSubmitError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const monthlyCostNumber = Number(monthlyPumpingCost.replace(/[^\d.]/g, '')) || 0;
  const twoYearSavings = monthlyCostNumber * 24;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Goslyn Installation Los Angeles', url: 'https://www.larestaurantservices.com/goslyn-installation-los-angeles' },
  ]);

  const serviceSchema = buildServiceSchema({
    name: 'Goslyn Installation Consultation Los Angeles',
    description:
      'Compare recurring grease trap pumping with Goslyn high-efficiency filtration and request a retrofit consultation in Los Angeles.',
    areaServed: ['Los Angeles', 'Ventura', 'San Bernardino', 'Orange County', 'San Diego'],
    serviceType: 'Goslyn Installation Consultation',
    url: 'https://www.larestaurantservices.com/goslyn-installation-los-angeles',
  });

  const faqItems = [
    {
      question: 'Is Goslyn installation compliant with Los Angeles health-code workflows?',
      answer:
        'The consultation is designed to evaluate retrofit fit and local compliance expectations for your kitchen layout before installation planning.',
    },
    {
      question: 'How quickly can a restaurant estimate ROI from current pumping costs?',
      answer:
        'You can estimate savings immediately by entering your monthly pumping cost. The page calculator projects a 2-year cost comparison.',
    },
    {
      question: 'Who should request a Goslyn consultation?',
      answer:
        'Operators with frequent pumping, odor/compliance pressure, or multiple high-output sinks are strong candidates for a retrofit review.',
    },
  ];

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!goslynService) {
      setSubmitError('Service configuration unavailable. Please call dispatch at (818) 698-4252.');
      return;
    }

    if (!businessName.trim()) {
      setSubmitError('Business / location name is required.');
      return;
    }
    if (!sinkCount.trim() || Number(sinkCount) < 1) {
      setSubmitError('Please enter a valid number of three-compartment sinks.');
      return;
    }
    if (!contactName.trim()) {
      setSubmitError('Contact name is required.');
      return;
    }
    if (!hasMinPhoneDigits(contactPhone)) {
      setSubmitError('Enter a valid 10-digit US phone number.');
      return;
    }
    if (!isValidEmail(contactEmail)) {
      setSubmitError('Enter a valid email address.');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const estimate = createManualReviewEstimate();
      const notes = [
        `Current pumping frequency: ${pumpingFrequency}`,
        `Three-compartment sinks: ${sinkCount}`,
        `City compliance notice: ${cityNotice}`,
        `Average monthly pumping cost: ${monthlyCostNumber > 0 ? `$${monthlyCostNumber.toLocaleString()}` : 'Not provided'}`,
        `Estimated 2-year savings: ${twoYearSavings > 0 ? `$${twoYearSavings.toLocaleString()}` : 'N/A'}`,
      ].join('\n');

      const payload = buildLeadPayload({
        service: goslynService,
        form: {
          ...defaultEstimateFormValues,
          businessName: businessName.trim(),
          frequency: pumpingFrequency === 'Monthly' ? Frequency.MONTHLY : Frequency.QUARTERLY,
          notes,
        },
        contact: {
          ...defaultEstimateContactValues,
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          preferredContact,
        },
        estimate,
        source: 'goslyn-solution-page',
      });

      const ok = await submitLeadPayload(payload);
      if (!ok) {
        throw new Error('Submission failed. Please try again or call dispatch at (818) 698-4252.');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Submission failed. Please try again or call dispatch at (818) 698-4252.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={serviceSchema} />
      <StructuredData data={buildFAQPageSchema(faqItems)} />

      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link to="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Zero-Maintenance Option</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-filter"></i>
              <span>Disruptor Path</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">
              Zero-Maintenance Option
              <br />
              <span className="text-amber-600">Goslyn Installation Los Angeles</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl font-medium">
              Compare recurring pumping costs against a long-term retrofit path. If your kitchen is ready for a cleaner, lower-maintenance setup, request a consultation.
            </p>
          </header>

          <div className="grid lg:grid-cols-[1fr,420px] gap-8 items-start">
            <div className="space-y-8">
              <section className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight">Standard Trap vs Goslyn System</h2>
                  <p className="text-slate-600 font-medium mt-2">A side-by-side view of operating pain points and retrofit outcomes.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className="text-left bg-slate-100 text-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] rounded-tl-xl">Factor</th>
                        <th className="text-left bg-red-50 text-red-700 px-4 py-3 text-xs font-black uppercase tracking-[0.12em]">Standard Trap</th>
                        <th className="text-left bg-emerald-50 text-emerald-700 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] rounded-tr-xl">Goslyn System</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 px-4 py-3 font-black text-slate-900">Odor Management</td>
                        <td className="border border-slate-200 px-4 py-3 text-slate-600 font-semibold">Frequent odor spikes between pump-outs</td>
                        <td className="border border-slate-200 px-4 py-3 text-slate-700 font-semibold">Grease separated at source for cleaner operation</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 px-4 py-3 font-black text-slate-900">Recurring Cost</td>
                        <td className="border border-slate-200 px-4 py-3 text-slate-600 font-semibold">Monthly or quarterly pumping invoices</td>
                        <td className="border border-slate-200 px-4 py-3 text-slate-700 font-semibold">$0 pumping fees under normal operation</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 px-4 py-3 font-black text-slate-900">Health Risk Exposure</td>
                        <td className="border border-slate-200 px-4 py-3 text-slate-600 font-semibold">Overfill windows can trigger compliance pressure</td>
                        <td className="border border-slate-200 px-4 py-3 text-slate-700 font-semibold">Stable FOG capture with no moving parts</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 px-4 py-3 font-black text-slate-900 rounded-bl-xl">FOG Recovery</td>
                        <td className="border border-slate-200 px-4 py-3 text-slate-600 font-semibold">Variable, service-interval dependent</td>
                        <td className="border border-slate-200 px-4 py-3 text-slate-700 font-semibold rounded-br-xl">Up to 99% FOG recovery at source</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight">2-Year ROI Calculator</h2>
                  <p className="text-slate-600 font-medium mt-2">Enter your average monthly pumping cost to estimate avoidable spend.</p>
                </div>
                <div className="grid sm:grid-cols-[1fr,auto] gap-4 items-end">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">Average monthly pumping cost</span>
                    <input
                      value={monthlyPumpingCost}
                      onChange={(e) => setMonthlyPumpingCost(e.target.value)}
                      inputMode="decimal"
                      placeholder="$450"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    />
                  </label>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Estimated 2-year savings</div>
                    <div className="text-3xl font-black text-emerald-800 tracking-tight">${twoYearSavings.toLocaleString()}</div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-xl space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight">How Goslyn Works</h2>
                  <p className="text-slate-600 font-medium mt-2">The system separates grease before it reaches your sewer line, reducing accumulation and recurring service interruptions.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700 text-center">No Moving Parts</div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700 text-center">Health-Code Compliant</div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700 text-center">City Program Compatible</div>
                </div>
              </section>

              <section className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-xl space-y-5">
                <h2 className="text-3xl font-black text-slate-950 tracking-tight">Goslyn Installation FAQ</h2>
                <div className="space-y-3">
                  {faqItems.map((faq, idx) => (
                    <details key={idx} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 group">
                      <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                        <span className="text-sm font-bold text-slate-900">{faq.question}</span>
                        <i className="fas fa-chevron-down text-xs text-slate-500 mt-1 group-open:rotate-180 transition-transform"></i>
                      </summary>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed mt-2">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 shadow-xl space-y-4">
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">Related Compliance Resources</h2>
                <p className="text-slate-600 font-medium">Use these guides to validate inspection-readiness and documentation workflows before retrofit planning.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    to="/la-fog-program-explained"
                    className="group border border-slate-200 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-slate-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <i className="fas fa-arrow-right text-[10px] text-amber-500"></i>
                      <span>LA FOG Program Explained</span>
                    </span>
                  </Link>
                  <Link
                    to="/la-restaurant-health-inspection-guide"
                    className="group border border-slate-200 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-slate-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <i className="fas fa-arrow-right text-[10px] text-amber-500"></i>
                      <span>LA Health Inspection Guide</span>
                    </span>
                  </Link>
                  <Link
                    to="/restaurant-fog-violations-fines-los-angeles"
                    className="group border border-slate-200 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-slate-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <i className="fas fa-arrow-right text-[10px] text-amber-500"></i>
                      <span>FOG Violations & Fines</span>
                    </span>
                  </Link>
                  <Link
                    to="/grease-trap-waste-manifest-explained"
                    className="group border border-slate-200 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-slate-600 hover:text-amber-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <i className="fas fa-arrow-right text-[10px] text-amber-500"></i>
                      <span>Waste Manifest Explained</span>
                    </span>
                  </Link>
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <form onSubmit={onSubmit} className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-white via-amber-50/50 to-white">
                  <div className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-700">Prospect Form</div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">Request a Goslyn Consultation</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Tell us your current setup and we will review retrofit fit.</p>
                </div>

                <div className="p-8 space-y-4">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">Business / Location Name</span>
                    <input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your business or property name"
                      autoComplete="organization"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">Current Pumping Frequency</span>
                    <select
                      value={pumpingFrequency}
                      onChange={(e) => setPumpingFrequency(e.target.value as 'Monthly' | 'Quarterly')}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">Number of Three-Compartment Sinks</span>
                    <input
                      value={sinkCount}
                      onChange={(e) => setSinkCount(e.target.value.replace(/\D/g, ''))}
                      inputMode="numeric"
                      placeholder="1"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">City Compliance Notice</span>
                    <select
                      value={cityNotice}
                      onChange={(e) => setCityNotice(e.target.value as 'Yes' | 'No')}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">Contact Name</span>
                    <input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    />
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">Phone</span>
                      <input
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(818) 000-0000"
                        autoComplete="tel"
                        type="tel"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">Email</span>
                      <input
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@restaurant.com"
                        autoComplete="email"
                        type="email"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">Preferred Contact Method</span>
                    <select
                      value={preferredContact}
                      onChange={(e) => setPreferredContact(e.target.value as 'either' | 'phone' | 'email')}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    >
                      <option value="either">Either phone or email</option>
                      <option value="phone">Call or text me</option>
                      <option value="email">Email only</option>
                    </select>
                  </label>

                  {submitError && (
                    <div className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm font-bold border border-red-100">{submitError}</div>
                  )}

                  {isSubmitted && (
                    <div className="rounded-2xl bg-emerald-50 text-emerald-800 px-4 py-3 text-sm font-bold border border-emerald-200">
                      An expert will contact you to review your kitchen layout for a Goslyn retrofit.
                    </div>
                  )}
                </div>

                <div className="px-8 py-4 border-t border-slate-100 bg-white">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black uppercase tracking-wide text-xs shadow-lg disabled:opacity-60 hover:bg-amber-400 transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Book Consultation'}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoslynInstallationLA;
