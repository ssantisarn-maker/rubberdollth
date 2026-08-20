import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { reviews } from '../../data/reviews';
import { translations } from '../../data/translations';

export default function ReviewSection({ lang = 'th' }) {
  const t = translations[lang] || translations.th;

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-bronze">
            {t.reviews.tag}
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl font-bold text-ink">
            {t.reviews.title}
          </h2>
          <div className="flex items-center justify-center gap-1 text-amber-500 pt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-ink font-semibold ml-2">{t.reviews.ratingText}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-sand-50/70 border border-sand-200 shadow-2xs hover:shadow-soft transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-ink-muted">{rev.date}</span>
                </div>

                <p className="text-xs text-ink-soft leading-relaxed font-light">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-sand-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-ink">{rev.author}</div>
                  <div className="text-[10px] text-ink-muted">{rev.location} • ซื้อรุ่น {rev.model}</div>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ยืนยันผู้ซื้อจริง</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
