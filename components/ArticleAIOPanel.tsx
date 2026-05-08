import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StructuredData, buildFAQPageSchema } from './StructuredData';

type ArticleAIOConfig = {
  quickAnswer: string;
  serviceKey: string;
  faqs: Array<{ question: string; answer: string }>;
};

const ARTICLE_AIO_BY_PATH: Record<string, ArticleAIOConfig> = {
  '/how-a-grease-trap-works': {
    serviceKey: 'grease-trap-interceptor',
    quickAnswer:
      'A grease trap slows wastewater so FOG rises and solids sink; it must be serviced before buildup reaches 25% of capacity to stay compliant in Los Angeles.',
    faqs: [
      {
        question: 'How often should a grease trap be cleaned in Los Angeles?',
        answer: 'Most kitchens need service every 2 to 8 weeks depending on trap size, menu, and dishwasher volume. Service is required before 25% buildup.',
      },
      {
        question: 'What is the 25% rule for grease traps?',
        answer: 'The combined FOG layer and bottom solids must stay below 25% of trap depth or liquid capacity. Above that, the trap is considered non-compliant.',
      },
      {
        question: 'Can a full grease trap affect my health inspection score?',
        answer: 'Yes. Inspectors can measure buildup and request service manifests. Missing records or excessive buildup can trigger deductions and re-inspections.',
      },
    ],
  },
  '/which-restaurants-need-grease-traps-los-angeles': {
    serviceKey: 'grease-trap-interceptor',
    quickAnswer:
      'Any Los Angeles food operation that cooks and discharges to sewer generally needs a grease interceptor, including restaurants, ghost kitchens, and commissary-based operations.',
    faqs: [
      {
        question: 'Do ghost kitchens need grease traps in Los Angeles?',
        answer: 'Yes. Ghost kitchens are treated as food service establishments when they cook and discharge wastewater to sewer.',
      },
      {
        question: 'Are food trucks exempt from grease trap rules?',
        answer: 'Food trucks rely on licensed commissaries, and those commissaries must meet grease interceptor requirements.',
      },
      {
        question: 'Who decides if my kitchen requires an interceptor?',
        answer: 'LACDPH Environmental Health and local sanitation authorities determine requirements based on your operation and discharge profile.',
      },
    ],
  },
  '/how-to-tell-if-grease-trap-was-serviced': {
    serviceKey: 'grease-trap-interceptor',
    quickAnswer:
      'A complete service includes full pump-out, scraping, documented volume, and a signed waste manifest. If those are missing, the service may be incomplete.',
    faqs: [
      {
        question: 'What paperwork should I receive after grease trap service?',
        answer: 'You should receive a service receipt and a signed waste manifest showing hauler details, volume removed, and disposal destination.',
      },
      {
        question: 'Is pumping only the top grease layer enough?',
        answer: 'No. Proper service removes top FOG, middle liquid, and bottom solids, plus baffle scraping and condition checks.',
      },
      {
        question: 'How long should a typical service take?',
        answer: 'It depends on trap size, but very short visits on large interceptors are a red flag for incomplete service.',
      },
    ],
  },
  '/grease-trap-cleaning-frequency-guide': {
    serviceKey: 'grease-trap-interceptor',
    quickAnswer:
      'Cleaning frequency depends on trap size and kitchen load, but the compliance threshold is fixed: service before FOG and solids reach 25% of capacity.',
    faqs: [
      {
        question: 'What interval is common for 500-gallon interceptors?',
        answer: 'Many full-service restaurants service 500-gallon interceptors every 4 to 8 weeks, adjusted by measured fill rate.',
      },
      {
        question: 'Do hot months affect grease buildup?',
        answer: 'Yes. Warmer weather can accelerate odors and instability, making tighter service intervals important during peak months.',
      },
      {
        question: 'How do I set the right service schedule?',
        answer: 'Start with baseline intervals, then calibrate using measured FOG depth from your first few services.',
      },
    ],
  },
  '/fats-oils-grease-sewer-impact-los-angeles': {
    serviceKey: 'grease-trap-interceptor',
    quickAnswer:
      'When FOG reaches public sewers, it cools, hardens, and restricts flow, raising overflow risk and creating regulatory and financial exposure for food businesses.',
    faqs: [
      {
        question: 'Why does FOG cause sewer blockages?',
        answer: 'FOG cools and sticks to pipe walls, creating layers that trap other debris and reduce pipe capacity over time.',
      },
      {
        question: 'Can my restaurant be liable for sewer overflows?',
        answer: 'Yes. If investigations tie upstream FOG discharges to your facility, agencies may assess penalties and remediation costs.',
      },
      {
        question: 'Does proper hauling matter after pump-out?',
        answer: 'Yes. Licensed transport and documented disposal are critical for legal compliance and traceability.',
      },
    ],
  },
  '/la-restaurant-health-inspection-guide': {
    serviceKey: 'compliance-audit',
    quickAnswer:
      'LA inspections are unannounced and scoring is point-based; grease records and 25% compliance frequently affect deductions, re-inspections, and posted grade outcomes.',
    faqs: [
      {
        question: 'Are LA restaurant health inspections announced?',
        answer: 'No. Routine inspections are generally unannounced, so records and sanitation readiness need to be continuous.',
      },
      {
        question: 'Do grease trap records impact health grades?',
        answer: 'Yes. Missing manifests or overdue maintenance can contribute to deductions and corrective actions.',
      },
      {
        question: 'What happens after a low inspection score?',
        answer: 'Facilities may face re-inspections, associated fees, and tighter enforcement timelines depending on severity.',
      },
    ],
  },
  '/la-fog-program-explained': {
    serviceKey: 'compliance-audit',
    quickAnswer:
      'The LA FOG Program requires approved interceptors, routine maintenance under the 25% rule, licensed hauling, and retained documentation for inspection and audit.',
    faqs: [
      {
        question: 'Who enforces the FOG Program in Los Angeles?',
        answer: 'LA Sanitation and Environment oversees city-level FOG compliance, with additional coordination from county and water quality authorities.',
      },
      {
        question: 'What records must be retained under FOG rules?',
        answer: 'Maintain service manifests and related records for at least three years and provide them upon request.',
      },
      {
        question: 'What happens if violations are ignored?',
        answer: 'Enforcement can escalate from notices to daily penalties, compliance orders, and potential permit impacts.',
      },
    ],
  },
  '/grease-trap-waste-manifest-explained': {
    serviceKey: 'grease-trap-interceptor',
    quickAnswer:
      'The waste manifest is your legal chain-of-custody record showing who hauled your grease waste, how much was removed, and where it was disposed.',
    faqs: [
      {
        question: 'Why is the grease waste manifest important?',
        answer: 'It proves lawful transport and disposal and is a core compliance document during inspections and audits.',
      },
      {
        question: 'How long should manifests be kept?',
        answer: 'Keep manifests for at least three years in both physical and digital records for quick retrieval.',
      },
      {
        question: 'What if my provider does not deliver manifests?',
        answer: 'That is a compliance risk. Require complete manifests on every visit and switch providers if documentation is inconsistent.',
      },
    ],
  },
  '/restaurant-fog-violations-fines-los-angeles': {
    serviceKey: 'compliance-audit',
    quickAnswer:
      'FOG penalties in Los Angeles can escalate quickly from inspection deductions to daily civil fines and major liability when overflows occur.',
    faqs: [
      {
        question: 'What is a common starting penalty for unresolved FOG non-compliance?',
        answer: 'Daily civil penalties often start around $500 per day depending on agency findings and enforcement stage.',
      },
      {
        question: 'Can both LACDPH and LASAN cite my facility?',
        answer: 'Yes. Health inspection actions and sanitation enforcement can run independently or in parallel.',
      },
      {
        question: 'How can I reduce risk after a notice of violation?',
        answer: 'Respond quickly, complete corrective service, and submit records before deadlines to limit escalation.',
      },
    ],
  },
  '/new-restaurant-grease-trap-compliance-la': {
    serviceKey: 'grease-trap-interceptor',
    quickAnswer:
      'New restaurant projects in LA should validate interceptor requirements early, complete permitting correctly, and set a documented service schedule before opening day.',
    faqs: [
      {
        question: 'When should interceptor planning start for a new restaurant?',
        answer: 'Start before lease finalization so site feasibility, sewer access, and required sizing are identified early.',
      },
      {
        question: 'Is health approval enough for grease compliance?',
        answer: 'Not always. Depending on location, sanitation and plumbing approvals are separate and all must be cleared.',
      },
      {
        question: 'What should I do before opening day?',
        answer: 'Set recurring service with a licensed hauler and establish recordkeeping for manifests and receipts from day one.',
      },
    ],
  },
};

export const ArticleAIOPanel: React.FC = () => {
  const location = useLocation();
  const config = ARTICLE_AIO_BY_PATH[location.pathname];

  if (!config) {
    return null;
  }

  return (
    <>
      <StructuredData data={buildFAQPageSchema(config.faqs)} />

      <section className="px-6 pt-6">
        <div className="max-w-4xl mx-auto rounded-3xl border border-amber-100 bg-amber-50/70 p-6 lg:p-8 space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em]">
            <span className="bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full">Quick Answer</span>
            <span className="text-slate-500">Reviewed by LA Restaurant Services</span>
            <span className="text-slate-500">Updated April 2, 2026</span>
          </div>

          <p className="text-slate-800 font-semibold leading-relaxed">
            {config.quickAnswer}
          </p>

          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-900">Common questions</h3>
            <div className="space-y-2">
              {config.faqs.map((faq, idx) => (
                <details key={idx} className="bg-white border border-amber-100 rounded-xl px-4 py-3 group">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                    <span className="text-sm font-bold text-slate-900">{faq.question}</span>
                    <i className="fas fa-chevron-down text-xs text-slate-500 mt-1 group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mt-2">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              to={`/instant-estimate?service=${config.serviceKey}`}
              className="inline-flex items-center justify-center bg-slate-950 text-white px-5 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-[11px] hover:bg-black transition-colors"
            >
              Get Instant Estimate
            </Link>
            <a
              href="tel:8186984252"
              className="inline-flex items-center justify-center border border-slate-300 text-slate-800 px-5 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-[11px] hover:border-amber-500 hover:text-amber-700 transition-colors"
            >
              Call Dispatch
            </a>
            <Link
              to={`/instant-estimate?service=${config.serviceKey}&contact=message#dispatch-help`}
              className="inline-flex items-center justify-center border border-slate-300 text-slate-800 px-5 py-3 rounded-xl font-black uppercase tracking-[0.16em] text-[11px] hover:border-amber-500 hover:text-amber-700 transition-colors"
            >
              Send Us a Message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
