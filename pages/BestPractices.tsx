import React from 'react';
import { StructuredData, buildBreadcrumbSchema } from '../components/StructuredData';
import { trackEvent } from '../api/gtag-utils';

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Restaurant Waste & Grease Best Practices',
  description: 'Operational best practices to reduce grease-related incidents, improve compliance readiness, and control sanitation costs.',
  author: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
  },
  publisher: {
    '@type': 'Organization',
    name: 'LA Restaurant Services',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.larestaurantservices.com/brand-hero.svg',
    },
  },
  mainEntityOfPage: 'https://www.larestaurantservices.com/best-practices',
};

const BestPractices: React.FC = () => {
  React.useEffect(() => {
    trackEvent('page_view_support', { page_type: 'best_practices' });
  }, []);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://www.larestaurantservices.com' },
    { name: 'Best Practices', url: 'https://www.larestaurantservices.com/best-practices' },
  ]);

  const practices = [
    {
      title: 'Follow the 25% rule rigorously',
      detail: 'Schedule service when FOG reaches 25% of trap capacity. Waiting longer raises overflow risk and fines.',
      icon: 'fa-gauge-high',
    },
    {
      title: 'Enforce pre-scrape workflow',
      detail: 'Train staff to scrape plates and pans before washing. This single behavior lowers solids and grease loading quickly.',
      icon: 'fa-utensils',
    },
    {
      title: 'Never flush grease with hot water',
      detail: 'Hot water moves grease downstream where it resolidifies in lines. Treat this as a zero-tolerance SOP item.',
      icon: 'fa-water',
    },
    {
      title: 'Run quarterly line health checks',
      detail: 'If your kitchen is high-volume, schedule preventive line checks and jetting windows before peak seasons.',
      icon: 'fa-magnifying-glass-chart',
    },
    {
      title: 'Keep documentation audit-ready',
      detail: 'Store manifests and receipts digitally with date, extracted volume, and disposal reference for inspections.',
      icon: 'fa-folder-open',
    },
    {
      title: 'Use a predictable service calendar',
      detail: 'Recurring service reduces emergencies and makes sanitation spend easier to forecast and control.',
      icon: 'fa-calendar-check',
    },
  ];

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />

      <div className="min-h-screen bg-[#FDFDFF] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <a href="/" className="hover:text-amber-600 transition-colors">Home</a>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-slate-950 font-bold">Best Practices</span>
          </nav>

          <header className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
              <i className="fas fa-lightbulb"></i>
              <span>Operations Playbook</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-950 leading-tight tracking-tighter">Best Practices for Kitchen Waste Operations</h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl font-medium">
              Practical standards your team can apply immediately to reduce backups, avoid fines, and protect service continuity.
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-6">
            {practices.map((item, idx) => (
              <article key={idx} className="bg-white border border-slate-100 rounded-3xl p-7 shadow-xl space-y-3">
                <div className="w-11 h-11 bg-slate-950 text-amber-400 rounded-xl flex items-center justify-center">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <h2 className="text-xl font-black text-slate-950">{item.title}</h2>
                <p className="text-slate-600 font-medium leading-relaxed">{item.detail}</p>
              </article>
            ))}
          </section>

          <section className="bg-slate-950 text-white rounded-3xl p-8 lg:p-10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Need a practical maintenance schedule?</h2>
              <p className="text-slate-300 text-sm font-medium mt-1">We can map your volume into a recurring service plan.</p>
            </div>
            <a
              href="/#estimator"
              onClick={() => trackEvent('support_page_cta_click', { page_type: 'best_practices', cta: 'build_my_plan' })}
              className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-black uppercase tracking-wide text-xs hover:bg-amber-400 transition-all"
            >
              Build My Plan
            </a>
          </section>
        </div>
      </div>
    </>
  );
};

export default BestPractices;
