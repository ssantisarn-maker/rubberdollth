import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { translations } from '../../data/translations';
import { useSiteFaqs } from '../../hooks/useSiteFaqs';

export default function FaqSection({ lang = 'th' }) {
  const [openIdx, setOpenIdx] = useState(0);
  const { faqs } = useSiteFaqs();
  const t = translations[lang] || translations.th;

  return (
    <section id="faq" className="py-16 sm:py-24 bg-sand-50 border-b border-sand-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-bronze">{t.faq.tag}</span>
          <h2 className="font-sans text-2xl sm:text-4xl font-bold text-ink">{t.faq.title}</h2>
          <p className="text-sm text-ink-muted font-light">{t.faq.desc}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={f.id || idx}
                className="rounded-2xl bg-white border border-sand-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-sans font-bold text-sm sm:text-base text-ink hover:text-bronze transition-colors tracking-normal"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-bronze font-mono text-xs">{idx + 1}.</span>
                    <span>{f.question || f.q}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-bronze transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-ink-muted font-light leading-relaxed border-t border-sand-100 pt-3 whitespace-pre-line">
                    {f.answer || f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
