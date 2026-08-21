import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { useLiveReviews } from '../../hooks/useLiveReviews';
import { translations } from '../../data/translations';

export default function ReviewSection({ lang = 'th' }) {
  const { reviews } = useLiveReviews();
  const [lightboxImage, setLightboxImage] = useState(null);
  const t = translations[lang] || translations.th;

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
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
            <span className="text-xs text-ink font-semibold ml-2">5.0 / 5.0 (รีวิวลูกค้าจริง 100%)</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => {
            const hasImages = (rev.images && rev.images.length > 0) || rev.image;
            const allImages = rev.images && rev.images.length > 0 ? rev.images : (rev.image ? [rev.image] : []);

            return (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-sand-50/70 border border-sand-200 shadow-2xs hover:shadow-soft transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Top: Stars & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-ink-muted">{rev.date}</span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-ink-soft leading-relaxed font-light">
                    "{rev.comment}"
                  </p>

                  {/* Customer Review Photos */}
                  {hasImages && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLightboxImage(img)}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-sand-300 hover:border-bronze hover:scale-105 transition-all shrink-0 group shadow-2xs"
                            title="คลิกเพื่อดูภาพขนาดใหญ่"
                          >
                            <img
                              src={img}
                              alt={`รีวิวจาก ${rev.name}`}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.src = '/favicon.png'; }}
                            />
                            <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer: Author, Model & Verified Badge */}
                <div className="pt-3 border-t border-sand-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-ink">{rev.name}</div>
                    <div className="text-[10px] text-ink-muted">
                      {rev.model ? `ซื้อรุ่น ${rev.model}` : 'ลูกค้าจริง'}
                    </div>
                  </div>
                  {rev.verified !== false && (
                    <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ยืนยันผู้ซื้อจริง</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-transparent rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-ink/70 text-white hover:bg-ink transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="รูปภาพรีวิวขนาดใหญ่"
              className="max-h-[85vh] w-auto object-contain rounded-2xl border border-white/20 shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </section>
  );
}
