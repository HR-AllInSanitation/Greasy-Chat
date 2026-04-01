import React from 'react';
import { getEstimatorServiceByKey } from '../data/serviceOptions';

interface ComplexCaseWidgetProps {
  serviceKey?: string | null;
}

export const ComplexCaseWidget: React.FC<ComplexCaseWidgetProps> = ({ serviceKey }) => {
  const service = getEstimatorServiceByKey(serviceKey ?? null);
  const serviceHref = service ? `/?service=${service.key}#estimator` : '/#estimator';

  return (
    <aside className="bg-slate-950 text-white rounded-[2rem] p-6 lg:p-7 shadow-2xl border border-white/5 space-y-5">
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
        <a href={serviceHref} className="bg-amber-500 text-slate-950 px-5 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-xs hover:bg-amber-400 transition-all shadow-lg">
          Open Dispatch Chat
        </a>
        <a href="tel:8186984252" className="bg-white/10 border border-white/15 text-white px-5 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-xs hover:bg-white/20 transition-all">
          Call Dispatch
        </a>
      </div>
    </aside>
  );
};
