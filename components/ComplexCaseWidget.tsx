import React from 'react';
import { inferServiceContext, trackLeadEvent } from '../api/gtag-utils';
import { getEstimatorServiceByKey } from '../data/serviceOptions';
import { hasMinPhoneDigits, isValidEmail } from '../utils/estimateFlow';

interface ComplexCaseWidgetProps {
  serviceKey?: string | null;
}

export const ComplexCaseWidget: React.FC<ComplexCaseWidgetProps> = ({ serviceKey }) => {
  const service = getEstimatorServiceByKey(serviceKey ?? null);
  const [showMessageForm, setShowMessageForm] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitError, setSubmitError] = React.useState('');
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('contact') === 'message') {
      setShowMessageForm(true);
    }
  }, []);

  const updateField = (key: 'name' | 'email' | 'phone' | 'message', value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!isValidEmail(form.email)) next.email = 'Enter a valid email address.';
    if (form.phone.trim() && !hasMinPhoneDigits(form.phone)) next.phone = 'Enter a valid 10-digit US phone number.';
    if (!form.message.trim()) next.message = 'Message is required.';
    return next;
  };

  const submitMessage = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/dispatch-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          serviceKey: service?.key || '',
          serviceLabel: service?.label || '',
          pagePath: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/instant-estimate',
          source: 'instant-estimate-message',
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.error || 'We could not send your message right now. Please call dispatch.');
      }

      // Fire only on successful contact form submission.
      trackLeadEvent('contact_form_submit', {
        page_path: typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/instant-estimate',
        service_context: inferServiceContext(typeof window !== 'undefined' ? window.location.pathname : '/instant-estimate'),
        service_key: service?.key || undefined,
      });

      setSubmitSuccess(true);
      setShowMessageForm(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setSubmitError(err?.message || 'We could not send your message right now. Please call dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside id="dispatch-help" className="bg-slate-950 text-white rounded-[2rem] p-6 lg:p-7 shadow-2xl border border-white/5 space-y-5">
      <div className="inline-flex items-center gap-2 bg-white/10 text-amber-300 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.22em] border border-white/10">
        <i className="fas fa-comments"></i>
        <span>Dispatch Help</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-black tracking-tight">Prefer to explain your situation?</h2>
        <p className="text-slate-300 text-sm font-medium leading-relaxed">
          Use the chat assistant to share access notes, scheduling constraints, multi-location details, or scope questions before dispatch follows up.
        </p>
      </div>

      <ul className="space-y-2 text-sm font-semibold text-slate-200">
        <li className="flex items-start gap-3"><i className="fas fa-check text-amber-400 mt-1"></i><span>Share site access, timing, and service details clearly</span></li>
        <li className="flex items-start gap-3"><i className="fas fa-check text-amber-400 mt-1"></i><span>Multi-site operators and schedule coordination</span></li>
        <li className="flex items-start gap-3"><i className="fas fa-check text-amber-400 mt-1"></i><span>Questions before you submit the request</span></li>
      </ul>

      <div className="flex flex-wrap gap-3">
        <a href="tel:8186984252" className="bg-amber-500 text-slate-950 px-5 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-xs hover:bg-amber-400 transition-all shadow-lg">
          Call Dispatch
        </a>
        <button
          type="button"
          onClick={() => { setShowMessageForm(prev => !prev); setSubmitSuccess(false); setSubmitError(''); }}
          className="bg-white/10 border border-white/15 text-white px-5 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-xs hover:bg-white/20 transition-all"
        >
          Send Us a Message
        </button>
      </div>

      {showMessageForm && (
        <div className="pt-2 border-t border-white/10 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-amber-300">Dispatch Message</h3>
            <p className="text-sm text-slate-300 font-medium">
              Send the details here and dispatch will receive it at the same inboxes used for estimate follow-up.
            </p>
          </div>

          {submitSuccess ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm font-semibold text-emerald-100">
              Message sent. Dispatch will follow up shortly.
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 block mb-1">Name</span>
                <input
                  aria-label="Dispatch message name"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Full name"
                  className={`w-full rounded-xl border px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                />
                {errors.name && <p className="text-xs text-red-300 font-semibold mt-1">{errors.name}</p>}
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 block mb-1">Email</span>
                <input
                  aria-label="Dispatch message email"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="you@restaurant.com"
                  className={`w-full rounded-xl border px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                />
                {errors.email && <p className="text-xs text-red-300 font-semibold mt-1">{errors.email}</p>}
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 block mb-1">Phone (optional)</span>
                <input
                  aria-label="Dispatch message phone"
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  placeholder="(818) 000-0000"
                  className={`w-full rounded-xl border px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                />
                {errors.phone && <p className="text-xs text-red-300 font-semibold mt-1">{errors.phone}</p>}
              </label>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 block mb-1">Message</span>
                <textarea
                  aria-label="Dispatch message body"
                  value={form.message}
                  onChange={e => updateField('message', e.target.value)}
                  rows={5}
                  placeholder={service?.label ? `Question about ${service.label.toLowerCase()}...` : 'How can dispatch help?'}
                  className={`w-full rounded-xl border px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400/60 resize-none ${errors.message ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
                />
                {errors.message && <p className="text-xs text-red-300 font-semibold mt-1">{errors.message}</p>}
              </label>

              {submitError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={submitMessage}
                disabled={isSubmitting}
                className="w-full bg-white text-slate-950 px-5 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-xs hover:bg-slate-100 transition-all disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
