import React from 'react';
import { Sparkles, Droplets, Wind, Feather, Box } from 'lucide-react';
import { translations } from '../../data/translations';

export default function CareGuide({ lang = 'th' }) {
  const t = translations[lang] || translations.th;

  const steps = [
    { title: t.careGuide.step1Title, desc: t.careGuide.step1Desc, icon: Droplets },
    { title: t.careGuide.step2Title, desc: t.careGuide.step2Desc, icon: Wind },
    { title: t.careGuide.step3Title, desc: t.careGuide.step3Desc, icon: Feather },
    { title: t.careGuide.step4Title, desc: t.careGuide.step4Desc, icon: Box },
  ];

  return (
    <section id="care" className="py-16 sm:py-24 bg-sand-50 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-bronze">
            {t.careGuide.tag}
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl font-bold text-ink">
            {t.careGuide.title}
          </h2>
          <p className="text-sm text-ink-muted font-light leading-relaxed">
            {t.careGuide.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-sand-200 shadow-soft hover:shadow-soft-hover transition-all duration-300 space-y-3.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-sand-50 border border-sand-200 flex items-center justify-center text-bronze">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-sans text-base font-bold text-ink">{s.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed font-light">{s.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
