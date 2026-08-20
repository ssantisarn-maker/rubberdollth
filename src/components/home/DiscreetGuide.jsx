import React from 'react';
import { Shield, Package, Lock, CheckCircle2 } from 'lucide-react';
import { translations } from '../../data/translations';

export default function DiscreetGuide({ lang = 'th' }) {
  const t = translations[lang] || translations.th;

  const layers = [
    {
      step: '1',
      title: t.discreetGuide.layer1Title,
      description: t.discreetGuide.layer1Desc,
      icon: Shield
    },
    {
      step: '2',
      title: t.discreetGuide.layer2Title,
      description: t.discreetGuide.layer2Desc,
      icon: Package
    },
    {
      step: '3',
      title: t.discreetGuide.layer3Title,
      description: t.discreetGuide.layer3Desc,
      icon: Lock
    }
  ];

  return (
    <section id="discreet" className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-bronze">
            {t.discreetGuide.tag}
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl font-bold text-ink">
            {t.discreetGuide.title}
          </h2>
          <p className="text-sm text-ink-muted font-light leading-relaxed">
            {t.discreetGuide.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {layers.map((l, idx) => {
            const Icon = l.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-sand-50/80 border border-sand-200 shadow-2xs hover:shadow-soft transition-all duration-300 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-sand-200 flex items-center justify-center text-bronze shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-sans text-3xl font-black tracking-tight text-sand-300">0{l.step}</span>
                </div>
                <h3 className="font-sans text-lg font-bold text-ink">{l.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed font-light">{l.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
