import React from 'react';
import { ShieldCheck, Package, RotateCcw, HeartHandshake, Sparkles } from 'lucide-react';
import { translations } from '../../data/translations';

export default function ValuePillars({ lang = 'th' }) {
  const t = translations[lang] || translations.th;

  const pillars = [
    {
      icon: Sparkles,
      title: t.values.v1_title,
      description: t.values.v1_desc,
    },
    {
      icon: Package,
      title: t.values.v2_title,
      description: t.values.v2_desc,
    },
    {
      icon: ShieldCheck,
      title: t.values.v3_title,
      description: t.values.v3_desc,
    },
    {
      icon: RotateCcw,
      title: t.values.v4_title,
      description: t.values.v4_desc,
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold tracking-widest text-bronze uppercase">
            {t.values.tag}
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-ink">
            {t.values.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-sand-50/70 border border-sand-200/80 hover:border-bronze hover:bg-sand-50 transition-all duration-300 shadow-2xs hover:shadow-soft space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-sand-200 flex items-center justify-center text-bronze shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-bold text-ink">
                  {item.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
