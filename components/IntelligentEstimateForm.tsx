import React from 'react';
import { trackConversion, trackEvent } from '../api/gtag-utils';
import { estimatorServiceOptions, getEstimatorServiceByKey } from '../data/serviceOptions';
import { ServiceType } from '../types';
import {
  buildLeadPayload,
  createEstimateFromForm,
  createManualReviewEstimate,
  defaultEstimateContactValues,
  defaultEstimateFormValues,
  submitLeadPayload,
  type EstimateContactValues,
  type EstimateFormValues,
} from '../utils/estimateFlow';

interface IntelligentEstimateFormProps {
  initialServiceKey?: string | null;
}

const addOnOptions = ['Hydrojetting', 'Grease Break Down', 'Lid Removal'];

export const IntelligentEstimateForm: React.FC<IntelligentEstimateFormProps> = ({ initialServiceKey }) => {
  const [selectedServiceKey, setSelectedServiceKey] = React.useState<string | null>(initialServiceKey ?? null);
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<EstimateFormValues>(defaultEstimateFormValues);
  const [contact, setContact] = React.useState<EstimateContactValues>(defaultEstimateContactValues);
  const [resultText, setResultText] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  const selectedService = React.useMemo(() => getEstimatorServiceByKey(selectedServiceKey), [selectedServiceKey]);
  const isQuoteFlow = selectedService?.mode === 'quote';

  React.useEffect(() => {
    trackEvent('quote_form_view', { entry: 'instant-estimate', service_key: selectedServiceKey || '' });
  }, [selectedServiceKey]);

  React.useEffect(() => {
    if (!selectedService?.defaultServiceType) return;
    setForm(prev => ({ ...prev, systemType: prev.systemType || selectedService.defaultServiceType || ServiceType.GREASE_TRAP }));
  }, [selectedService]);

  const updateForm = <K extends keyof EstimateFormValues>(key: K, value: EstimateFormValues[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateContact = <K extends keyof EstimateContactValues>(key: K, value: EstimateContactValues[K]) => {
    setContact(prev => ({ ...prev, [key]: value }));
  };

  const toggleAddOn = (name: string) => {
    setForm(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(name)
        ? prev.additionalServices.filter(item => item !== name)
        : [...prev.additionalServices, name],
    }));
  };

  const validateCurrentStep = () => {
    if (!selectedService) return 'Select a service first.';
    if (step === 1) {
      if (!form.businessName.trim()) return 'Business name is required.';
      if (!isQuoteFlow) return '';
      if (!form.addressLine.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim()) return 'Complete the service address.';
      if (!form.gallons.trim()) return 'Capacity is required.';
      if (!form.parkingDistance.trim()) return 'Parking distance is required.';
    }
    if (step === 2) {
      if (!contact.contactName.trim()) return 'Contact name is required.';
      if (!contact.contactPhone.trim()) return 'Phone is required.';
      if (!contact.contactEmail.trim()) return 'Email is required.';
    }
    return '';
  };

  const totalSteps = selectedService ? 3 : 1;

  const goNext = async () => {
    const validation = validateCurrentStep();
    setError(validation);
    if (validation) return;

    if (!selectedService) return;

    if (step < 2) {
      const nextStep = step + 1;
      setStep(nextStep);
      trackEvent('quote_step_complete', { step_number: step + 1, service_key: selectedService.key });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const estimate = isQuoteFlow ? await createEstimateFromForm(form) : createManualReviewEstimate();
      const payload = buildLeadPayload({
        service: selectedService,
        form,
        contact,
        estimate,
      });
      const submitted = await submitLeadPayload(payload);

      if (!submitted) {
        throw new Error('We could not submit the lead right now.');
      }

      trackConversion({
        phone: contact.contactPhone,
        email: contact.contactEmail,
        service: selectedService.label,
      });
      trackEvent('quote_lead_submit', { service_key: selectedService.key, quote_mode: isQuoteFlow ? 'estimate' : 'manual_review' });

      setResultText(
        isQuoteFlow
          ? estimate.manualQuote
            ? 'Your request was captured. This estimate needs office review, and our team will follow up with next steps.'
            : `${estimate.baseServiceLabel || 'Estimated service'}: ${estimate.totalPrice !== null ? `$${estimate.totalPrice}` : 'Office review required'}`
          : 'Your request has been captured and routed for office follow-up.',
      );
      setStep(3);
    } catch (submitError: any) {
      setError(submitError?.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setSelectedServiceKey(initialServiceKey ?? null);
    setStep(initialServiceKey ? 1 : 0);
    setForm(defaultEstimateFormValues);
    setContact(defaultEstimateContactValues);
    setResultText('');
    setError('');
  };

  React.useEffect(() => {
    if (initialServiceKey) setStep(1);
  }, [initialServiceKey]);

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden">
      <div className="bg-slate-950 text-white px-8 py-6 border-b border-white/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-400">Intelligent Estimate</div>
            <h2 className="text-2xl font-black tracking-tight">Fast Quote Form</h2>
          </div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Step {Math.min(step + 1, totalSteps)} / {totalSteps}</div>
        </div>
      </div>

      <div className="p-8 lg:p-10 space-y-8">
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
                {isQuoteFlow ? 'Tell us about the site so we can calculate a structured estimate.' : 'We will collect the essentials and route this to the office for follow-up.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Business name</span>
                <input value={form.businessName} onChange={e => updateForm('businessName', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
              </label>

              {isQuoteFlow ? (
                <>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Street address</span>
                    <input value={form.addressLine} onChange={e => updateForm('addressLine', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">City</span>
                    <input value={form.city} onChange={e => updateForm('city', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">State</span>
                    <input value={form.state} onChange={e => updateForm('state', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">ZIP</span>
                    <input value={form.zip} onChange={e => updateForm('zip', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">System type</span>
                    <select value={form.systemType} onChange={e => updateForm('systemType', e.target.value as ServiceType)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold bg-white">
                      <option value={ServiceType.GREASE_TRAP}>Grease Trap</option>
                      <option value={ServiceType.INTERCEPTOR}>Interceptor</option>
                      <option value={ServiceType.CLARIFIER}>Clarifier</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Capacity (gallons)</span>
                    <input value={form.gallons} onChange={e => updateForm('gallons', e.target.value)} placeholder="Ex: 1000 or 2500+" className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Parking distance (ft)</span>
                    <input value={form.parkingDistance} onChange={e => updateForm('parkingDistance', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
                  </label>
                  <div className="space-y-2 md:col-span-2">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Add-ons</span>
                    <div className="flex flex-wrap gap-2">
                      {addOnOptions.map(name => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleAddOn(name)}
                          className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.12em] border ${form.additionalServices.includes(name) ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-700 border-slate-200'}`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Notes / scope details</span>
                  <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows={5} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
                </label>
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
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Contact name</span>
                <input value={contact.contactName} onChange={e => updateContact('contactName', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Phone</span>
                <input value={contact.contactPhone} onChange={e => updateContact('contactPhone', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Email</span>
                <input value={contact.contactEmail} onChange={e => updateContact('contactEmail', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold" />
              </label>
            </div>
          </div>
        )}

        {step === 3 && selectedService && (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl">
              <i className="fas fa-check"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-950 tracking-tight">Request captured</h3>
              <p className="text-slate-600 font-medium mt-2">{resultText}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="tel:8186984252" className="bg-slate-950 text-white px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs">Call Dispatch</a>
              <button type="button" onClick={resetFlow} className="bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs">
                Start New Request
              </button>
            </div>
          </div>
        )}

        {error && <div className="rounded-2xl bg-red-50 text-red-700 px-4 py-3 text-sm font-bold border border-red-100">{error}</div>}

        {step < 3 && (
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setStep(prev => Math.max(0, prev - 1))}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-black uppercase tracking-wide text-xs disabled:opacity-50"
              disabled={step === 0 || isSubmitting}
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black uppercase tracking-wide text-xs shadow-lg disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : step === 2 ? 'Submit Request' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
