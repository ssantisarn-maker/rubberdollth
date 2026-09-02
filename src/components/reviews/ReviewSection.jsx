import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { useLiveReviews } from '../../hooks/useLiveReviews';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { translations } from '../../data/translations';

export default function ReviewSection({ lang = 'th' }) {
  const { reviews } = useLiveReviews();
  const { settings } = useSiteSettings();
  const [lightboxImage, setLightboxImage] = useState(null);
  const t = translations[lang] || translations.th;

  const reviewTag = settings.reviews_tag || t.reviews.tag;
  const reviewTitle = settings.reviews_title || t.reviews.title;
  const ratingText = settings.reviews_rating_text || '5.0 / 5.0 (รีวิวลูกค้าจริง 100%)';

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-bronze">
            {reviewTag}
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl font-extrabold text-ink">
            {reviewTitle}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-amber-500 pt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm sm:text-base text-ink font-bold ml-2">{ratingText}</span>
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
                className="p-6 sm:p-7 rounded-3xl bg-sand-50/90 border border-sand-300 shadow-2xs hover:shadow-soft transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  
                  {/* Top: Stars & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-ink-muted">{rev.date}</span>
                  </div>

                  {/* Comment - Bold, Clear, Large Font */}
                  <p className="text-sm sm:text-base text-ink font-bold leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {/* Customer Review Photos */}
                  {hasImages && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLightboxImage(img)}
                            className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-sand-300 hover:border-bronze hover:scale-105 transition-all shrink-0 group shadow-sm bg-white"
                            title="คลิกเพื่อดูภาพขนาดใหญ่"
                          >
                            <img
                              src={img}
                              alt={`รีวิวจาก ${rev.name}`}
                              className="w-full h-full object-cover"
                              onError={e => { e.target.src = '/favicon.png'; }}
                            />
                            <div className="absolute inset-0 bg-ink/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer: Author, Model & Verified Badge */}
                <div className="pt-4 border-t border-sand-200 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <div className="font-extrabold text-ink text-sm sm:text-base">{rev.name}</div>
                    <div className="text-xs font-medium text-amber-900/80">
                      {rev.model ? `ซื้อรุ่น ${rev.model}` : 'ลูกค้าจริง'}
                    </div>
                  </div>
                  {rev.verified !== false && (
                    <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300 shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
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
          className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black/40 rounded-3xl p-2 border border-white/20 shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 z-10 p-2.5 rounded-full bg-ink text-white hover:bg-rose-600 transition-colors shadow-lg border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="ภาพรีวิวจากลูกค้า"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

    </section>
  );
}
