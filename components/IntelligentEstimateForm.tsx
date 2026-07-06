import React from 'react';
import { inferServiceContext, trackConversion, trackEvent, trackLeadEvent } from '../api/gtag-utils';
import { estimatorServiceOptions, getEstimatorServiceByKey } from '../data/serviceOptions';
import { Frequency, ServiceType, type EstimationResult } from '../types';
import {
  buildLeadPayload,
  createEstimateFromForm,
  createManualReviewEstimate,
  defaultEstimateContactValues,
  defaultEstimateFormValues,
  hasMinPhoneDigits,
  isValidEmail,
  submitLeadPayload,
  type EstimateContactValues,
  type EstimateFormValues,
} from '../utils/estimateFlow';

interface IntelligentEstimateFormProps {
  initialServiceKey?: string | null;
}

const addOnOptions = ['Hydrojetting', 'Grease Break Down', 'Lid Removal'];

const SERVICE_NOTES_CONFIG: Record<string, { prompt: string; placeholder: string }> = {
  'goslyn-consultation': {
    prompt: 'Tell us about your current pumping setup',
    placeholder: 'Monthly or quarterly pumping schedule, number of 3-compartment sinks, and any active city notice...',
  },
  'septic-holding-tank': {
    prompt: 'Describe the system',
    placeholder: 'Tank size (if known), when last pumped, any access or odor issues...',
  },
  'hydro-jetting': {
    prompt: 'Describe the drain issue',
    placeholder: 'Location of blockage, symptoms (slow drain, backup), any prior attempts to clear...',
  },
  'uco-recycling': {
    prompt: 'Tell us about your oil volume',
    placeholder: 'Estimated gallons per week, current container setup, preferred pickup schedule...',
  },
  'restroom-rentals': {
    prompt: 'Describe the rental need',
    placeholder: 'Event date, expected guest count, number of units needed, indoor or outdoor venue...',
  },
  'compliance-audit': {
    prompt: 'Describe the audit scope',
    placeholder: 'Type of inspection, any recent violations, regulatory body (LACSD, EPA, LA County Health)...',
  },
  'hood-cleaning': {
    prompt: 'Describe the hood setup',
    placeholder: 'Number of hoods, kitchen type, when last cleaned, any compliance deadline...',
  },
  'janitorial-services': {
    prompt: 'Describe the scope',
    placeholder: 'Facility size (sq ft), frequency needed, areas of focus, any special requirements...',
  },
};

const DEFAULT_NOTES_CONFIG = {
  prompt: 'Notes / scope details',
  placeholder: 'Any relevant details about your request...',
};

const formatPriceRange = (est: EstimationResult): string => {
  if (est.minPrice !== null && est.maxPrice !== null) {
    return est.minPrice === est.maxPrice
      ? `$${est.minPrice.toLocaleString()}`
      : `$${est.minPrice.toLocaleString()} - $${est.maxPrice.toLocaleString()}`;
  }
  if (est.totalPrice != null) return `$${(est.totalPrice as number).toLocaleString()}`;
  return 'Office review required';
};

const Field: React.FC<{ label: string; error?: string; span2?: boolean; children: React.ReactNode }> = ({
  label, error, span2, children,
}) => (
  <label className={`block${span2 ? ' md:col-span-2' : ''}`}>
    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 block mb-1">{label}</span>
    {children}
    {error && <p className="text-xs text-red-600 font-semibold mt-1">{error}</p>}
  </label>
);

export const IntelligentEstimateForm: React.FC<IntelligentEstimateFormProps> = ({ initialServiceKey }) => {
  const [selectedServiceKey, setSelectedServiceKey] = React.useState<string | null>(initialServiceKey ?? null);
  const [step, setStep] = React.useState(initialServiceKey ? 1 : 0);
  const [form, setForm] = React.useState<EstimateFormValues>(defaultEstimateFormValues);
  const [contact, setContact] = React.useState<EstimateContactValues>(defaultEstimateContactValues);
  const [estimateResult, setEstimateResult] = React.useState<EstimationResult | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedService = React.useMemo(() => getEstimatorServiceByKey(selectedServiceKey), [selectedServiceKey]);
  const isQuoteFlow = selectedService?.mode === 'quote';
  const isManualReview = estimateResult?.manualQuote === true;

  React.useEffect(() => {
    trackEvent('quote_form_view', { entry: 'instant-estimate', service_key: selectedServiceKey || '' });
  }, [selectedServiceKey]);

  React.useEffect(() => {
    if (!selectedService?.defaultServiceType) return;
    setForm(prev => ({ ...prev, systemType: prev.systemType || selectedService.defaultServiceType || ServiceType.GREASE_TRAP }));
  }, [selectedService]);

  const updateForm = <K extends keyof EstimateFormValues>(key: K, value: EstimateFormValues[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const updateContact = <K extends keyof EstimateContactValues>(key: K, value: EstimateContactValues[K]) => {
    setContact(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const toggleAddOn = (name: string) => {
    setForm(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(name)
        ? prev.additionalServices.filter(item => item !== name)
        : [...prev.additionalServices, name],
    }));
  };

  const validateStep = (stepNum: number): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (stepNum === 1) {
      if (!form.businessName.trim()) errors.businessName = 'Business name is required.';
      if (isQuoteFlow) {
        if (!form.addressLine.trim()) errors.addressLine = 'Street address is required.';
        if (!form.city.trim()) errors.city = 'City is required.';
        if (!/^[A-Za-z]{2}$/.test(form.state.trim())) errors.state = 'Enter a valid 2-letter state (e.g. CA).';
        if (!/^\d{5}$/.test(form.zip.trim())) errors.zip = 'Enter a valid 5-digit ZIP code.';
        const isGreaseTrap = form.systemType === ServiceType.GREASE_TRAP;
        if (!isGreaseTrap && !form.gallons.trim()) {
          errors.gallons = 'Select a capacity tier.';
        }
        if (!form.parkingDistance.trim()) {
          errors.parkingDistance = 'Select hose / parking distance.';
        }
      }
    }
    if (stepNum === 2) {
      if (!contact.contactName.trim()) errors.contactName = 'Contact name is required.';
      if (!hasMinPhoneDigits(contact.contactPhone)) {
        errors.contactPhone = 'Enter a valid 10-digit US phone number.';
      }
      if (!isValidEmail(contact.contactEmail)) {
        errors.contactEmail = 'Enter a valid email address.';
      }
    }
    return errors;
  };

  const inputCls = (key: string) =>
    `w-full rounded-xl border px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-colors ${
      fieldErrors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
    }`;

  const fe = fieldErrors;

  const goNext = async () => {
    if (!selectedService) return;
    const errors = validateStep(step);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitError('');

    if (step < 2) {
      setStep(step + 1);
      trackEvent('quote_step_complete', { step_number: step + 1, service_key: selectedService.key });
      return;
    }

    setIsSubmitting(true);
    try {
      const estimate = isQuoteFlow ? await createEstimateFromForm(form) : createManualReviewEstimate();
      const payload = buildLeadPayload({ service: selectedService, form, contact, estimate });
      const ok = await submitLeadPayload(payload);
      if (!ok) throw new Error('We could not submit the request right now. Please call us directly.');
      setEstimateResult(estimate);

      // Fire only on successful lead submission (never on button click).
      trackLeadEvent('request_quote_submit', {
        page_path: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/instant-estimate',
        service_context: inferServiceContext(typeof window !== 'undefined' ? window.location.pathname : '/instant-estimate'),
        service_key: selectedService.key,
        quote_mode: isQuoteFlow ? 'estimate' : 'manual_review',
      });

      trackConversion({ phone: contact.contactPhone, email: contact.contactEmail, service: selectedService.label });
      trackEvent('quote_lead_submit', { service_key: selectedService.key, quote_mode: isQuoteFlow ? 'estimate' : 'manual_review' });
      setStep(3);
    } catch (err: any) {
      setSubmitError(err?.message || 'Submission failed. Please try again or call us at (818) 698-4252.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setSelectedServiceKey(initialServiceKey ?? null);
    setStep(initialServiceKey ? 1 : 0);
    setForm(defaultEstimateFormValues);
    setContact(defaultEstimateContactValues);
    setEstimateResult(null);
    setFieldErrors({});
    setSubmitError('');
  };

  React.useEffect(() => {
    if (initialServiceKey) setStep(1);
  }, [initialServiceKey]);

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:h-[calc(100dvh-12rem)]">
      <div className="shrink-0 px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-white via-amber-50/50 to-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-sm">
              <i className="fas fa-file-invoice-dollar text-lg" aria-hidden="true"></i>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-700">Intelligent Estimate</div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Fast Quote Form</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Structured intake for faster pricing, cleaner follow-up, and manual review when needed.</p>
            </div>
          </div>
          {step >= 1 && step <= 2 && (
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2">Step {step} / 2</div>
          )}
          {step === 3 && (
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">Complete</div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-8 lg:p-10 space-y-8">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-black text-slate-950 tracking-tight">Choose your service</h3>
              <p className="text-slate-600 font-medium mt-2">Use the structured form for faster estimates and cleaner follow-up.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {estimatorServiceOptions.map(option => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    setSelectedServiceKey(option.key);
                    setStep(1);
                    trackEvent('quote_form_start', { service_key: option.key });
                  }}
                  className="text-left bg-white border border-slate-200 hover:border-amber-400 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center mb-4">
                    <i className={`fas ${option.icon}`}></i>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] font-black text-amber-600 mb-2">{option.tag}</div>
                  <div className="text-xl font-black text-slate-950 mb-2">{option.label}</div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedService && step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-black text-amber-600 mb-2">{selectedService.tag}</div>
              <h3 className="text-3xl font-black text-slate-950 tracking-tight">{selectedService.label}</h3>
              <p className="text-slate-600 font-medium mt-2">
                {isQuoteFlow ? 'Tell us about the site so we can calculate a structured estimate.' : "We'll collect the essentials and route this to the right specialist."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Business name" error={fe.businessName} span2>
                <input
                  value={form.businessName}
                  onChange={e => updateForm('businessName', e.target.value)}
                  placeholder="Your business or property name"
                  autoComplete="organization"
                  className={inputCls('businessName')}
                />
              </Field>

              {isQuoteFlow ? (
                <>
                  <Field label="Street address" error={fe.addressLine} span2>
                    <input
                      value={form.addressLine}
                      onChange={e => updateForm('addressLine', e.target.value)}
                      placeholder="123 Main St"
                      autoComplete="address-line1"
                      className={inputCls('addressLine')}
                    />
                  </Field>
                  <Field label="City" error={fe.city}>
                    <input
                      value={form.city}
                      onChange={e => updateForm('city', e.target.value)}
                      placeholder="Los Angeles"
                      autoComplete="address-level2"
                      className={inputCls('city')}
                    />
                  </Field>
                  <Field label="State" error={fe.state}>
                    <input
                      value={form.state}
                      onChange={e => updateForm('state', e.target.value.toUpperCase())}
                      placeholder="CA"
                      maxLength={2}
                      autoComplete="address-level1"
                      className={inputCls('state')}
                    />
                  </Field>
                  <Field label="ZIP code" error={fe.zip}>
                    <input
                      value={form.zip}
                      onChange={e => updateForm('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="90001"
                      maxLength={5}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      className={inputCls('zip')}
                    />
                  </Field>
                  <Field label="System type" error={fe.systemType}>
                    <select
                      aria-label="System type"
                      value={form.systemType}
                      onChange={e => {
                        const nextType = e.target.value as ServiceType;
                        setForm(prev => ({
                          ...prev,
                          systemType: nextType,
                          gallons: nextType === ServiceType.GREASE_TRAP ? '' : prev.gallons,
                        }));
                        setFieldErrors(prev => {
                          const n = { ...prev };
                          delete n.systemType;
                          if (nextType === ServiceType.GREASE_TRAP) delete n.gallons;
                          return n;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    >
                      <option value={ServiceType.GREASE_TRAP}>Grease Trap (up to 100 gallons)</option>
                      <option value={ServiceType.INTERCEPTOR}>Interceptor</option>
                      <option value={ServiceType.CLARIFIER}>Clarifier</option>
                    </select>
                  </Field>
                  <Field label="Service frequency" error={fe.frequency}>
                    <select
                      aria-label="Service frequency"
                      value={form.frequency}
                      onChange={e => updateForm('frequency', e.target.value as Frequency)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    >
                      <option value={Frequency.MONTHLY}>Monthly</option>
                      <option value={Frequency.QUARTERLY}>Quarterly</option>
                      <option value={Frequency.BI_ANNUAL}>Bi-Annual</option>
                      <option value={Frequency.ONCE}>One-time / as needed</option>
                    </select>
                  </Field>
                  {form.systemType !== ServiceType.GREASE_TRAP && (
                    <Field label="Capacity (gallons)" error={fe.gallons}>
                      <select
                        aria-label="Capacity (gallons)"
                        value={form.gallons}
                        onChange={e => updateForm('gallons', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                      >
                        <option value="">Select capacity tier</option>
                        <option value="1600">Up to 1,600 gallons</option>
                        <option value="2500">Up to 2,500 gallons</option>
                        <option value="2501">Over 2,500 gallons (office review)</option>
                      </select>
                    </Field>
                  )}
                  <Field label="Hose / parking distance" error={fe.parkingDistance}>
                    <select
                      aria-label="Hose / parking distance"
                      value={form.parkingDistance}
                      onChange={e => updateForm('parkingDistance', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    >
                      <option value="50">Up to 50 ft</option>
                      <option value="100">100 ft</option>
                      <option value="150">150 ft</option>
                      <option value="200">200 ft</option>
                      <option value="250">250 ft</option>
                    </select>
                  </Field>
                  <div className="space-y-2 md:col-span-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Add-ons (optional)</span>
                    <div className="flex flex-wrap gap-2">
                      {addOnOptions.map(name => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleAddOn(name)}
                          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.12em] border transition-colors ${
                            form.additionalServices.includes(name)
                              ? 'bg-slate-950 text-white border-slate-950'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                (() => {
                  const cfg = SERVICE_NOTES_CONFIG[selectedService.key] ?? DEFAULT_NOTES_CONFIG;
                  return (
                    <Field label={cfg.prompt} error={fe.notes} span2>
                      <textarea
                        value={form.notes}
                        onChange={e => updateForm('notes', e.target.value)}
                        rows={5}
                        placeholder={cfg.placeholder}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60 resize-none"
                      />
                    </Field>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {selectedService && step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-black text-slate-950 tracking-tight">Where should we send the follow-up?</h3>
              <p className="text-slate-600 font-medium mt-2">This lets the office confirm pricing, schedule, and service scope.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Contact name" error={fe.contactName} span2>
                <input
                  value={contact.contactName}
                  onChange={e => updateContact('contactName', e.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                  className={inputCls('contactName')}
                />
              </Field>
              <Field label="Phone" error={fe.contactPhone}>
                <input
                  value={contact.contactPhone}
                  onChange={e => updateContact('contactPhone', e.target.value)}
                  placeholder="(818) 000-0000"
                  autoComplete="tel"
                  inputMode="tel"
                  type="tel"
                  className={inputCls('contactPhone')}
                />
              </Field>
              <Field label="Email" error={fe.contactEmail}>
                <input
                  value={contact.contactEmail}
                  onChange={e => updateContact('contactEmail', e.target.value)}
                  placeholder="you@restaurant.com"
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  className={inputCls('contactEmail')}
                />
              </Field>
              <Field label="Preferred contact method" error={fe.preferredContact} span2>
                <select
                  aria-label="Preferred contact method"
                  value={contact.preferredContact}
                  onChange={e => updateContact('preferredContact', e.target.value as EstimateContactValues['preferredContact'])}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                >
                  <option value="either">Either phone or email - whatever is fastest</option>
                  <option value="phone">Call or text me</option>
                  <option value="email">Email only</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 3 && selectedService && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">
              <i className="fas fa-check"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-950 tracking-tight">
                {isQuoteFlow && !isManualReview ? 'Here is your estimate' : 'Request captured'}
              </h3>
              <p className="text-slate-500 text-sm font-semibold mt-1">Confirmation sent to {contact.contactEmail}</p>
            </div>

            {isQuoteFlow && estimateResult && !isManualReview && (
              <div className="bg-slate-950 text-white rounded-3xl p-8 space-y-4">
                <div className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-400">{selectedService.label}</div>
                <div className="text-5xl font-black tracking-tight leading-none">{formatPriceRange(estimateResult)}</div>
                {(estimateResult.addOns && estimateResult.addOns.length > 0 || (estimateResult.breakdown?.hoseFee ?? 0) > 0) && (
                  <div className="border-t border-white/10 pt-4 space-y-1">
                    {estimateResult.addOns?.map(ao => (
                      <div key={ao.name} className="flex justify-between text-sm font-semibold text-slate-300">
                        <span>{ao.name}</span>
                        <span>+${ao.price.toLocaleString()}</span>
                      </div>
                    ))}
                    {(estimateResult.breakdown?.hoseFee ?? 0) > 0 && (
                      <div className="flex justify-between text-sm font-semibold text-slate-300">
                        <span>Additional hose charge</span>
                        <span>+${estimateResult.breakdown.hoseFee.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-400 font-medium pt-2 border-t border-white/10">
                  Final pricing may vary based on actual site conditions. Our dispatcher will confirm before scheduling.
                </p>
              </div>
            )}

            {(!isQuoteFlow || isManualReview) && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <p className="font-bold text-slate-800 leading-relaxed">
                  {isManualReview
                    ? 'This estimate requires a quick office review. Our dispatcher will reach out within 1 business day to confirm scope and pricing.'
                    : `Your ${selectedService.label.toLowerCase()} request has been forwarded to our specialist team. Expect to hear back within 1 business day.`}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <a href="tel:8186984252" className="bg-slate-950 text-white px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs flex items-center gap-2">
                <i className="fas fa-phone"></i>Call Dispatch
              </a>
              <button type="button" onClick={resetFlow} className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:border-slate-400 transition-colors">
                Start New Request
              </button>
            </div>
          </div>
        )}

      </div>

      {submitError && (
        <div className="shrink-0 px-8 lg:px-10 pb-3">
          <div className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm font-bold border border-red-100">{submitError}</div>
        </div>
      )}

      {step >= 1 && step <= 2 && (
        <div className="shrink-0 px-8 lg:px-10 py-4 bg-white border-t border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => { setStep(prev => Math.max(0, prev - 1)); setFieldErrors({}); setSubmitError(''); }}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-black uppercase tracking-wide text-xs disabled:opacity-40 hover:border-slate-400 transition-colors"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black uppercase tracking-wide text-xs shadow-lg disabled:opacity-60 hover:bg-amber-400 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : step === 2 ? 'Submit Request' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
