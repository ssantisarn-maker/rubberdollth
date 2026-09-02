import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, Image as ImageIcon, X, Sparkles, ZoomIn } from 'lucide-react';
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.map((rev) => {
            const hasImages = (rev.images && rev.images.length > 0) || rev.image;
            const allImages = rev.images && rev.images.length > 0 ? rev.images : (rev.image ? [rev.image] : []);
            const mainImg = allImages[0];

            return (
              <div
                key={rev.id}
                className="p-5 sm:p-6 rounded-3xl bg-sand-50/90 border border-sand-300 shadow-2xs hover:shadow-soft transition-all duration-300 flex flex-col sm:flex-row items-start gap-4 sm:gap-5"
              >
                {/* LEFT SIDE: Customer Photo */}
                <div className="shrink-0 w-full sm:w-32 flex flex-col items-center sm:items-start gap-2">
                  {hasImages ? (
                    <div className="relative group w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden border-2 border-sand-300 shadow-sm bg-white cursor-pointer"
                         onClick={() => setLightboxImage(mainImg)}>
                      <img
                        src={mainImg}
                        alt={`ภาพรีวิวจาก ${rev.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.src = '/favicon.png'; }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn className="w-6 h-6 drop-shadow" />
                      </div>
                      {allImages.length > 1 && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          +{allImages.length - 1} รูป
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl bg-sand-200/80 border border-sand-300 flex flex-col items-center justify-center text-amber-800/60 text-xs font-bold gap-1 shadow-2xs">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                      <span>รีวิวลูกค้า</span>
                    </div>
                  )}

                  {/* Multiple image thumbnails if available */}
                  {allImages.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                      {allImages.slice(1, 4).map((subImg, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setLightboxImage(subImg)}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-sand-300 hover:border-bronze shrink-0"
                        >
                          <img src={subImg} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE: Text Content & Author */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-full space-y-3 w-full">
                  
                  {/* Top: Stars & Date */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-ink-muted">{rev.date}</span>
                  </div>

                  {/* Comment Quote - Bold, Crisp, Large */}
                  <p className="text-sm sm:text-base text-ink font-bold leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {/* Bottom: Author & Verified Badge */}
                  <div className="pt-3 border-t border-sand-200 flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
                    <div>
                      <span className="font-extrabold text-ink block text-sm sm:text-base">{rev.name}</span>
                      <span className="text-xs font-medium text-amber-900/80">
                        {rev.model ? `ซื้อรุ่น ${rev.model}` : 'ลูกค้าจริง'}
                      </span>
                    </div>

                    {rev.verified !== false && (
                      <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300 shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ยืนยันผู้ซื้อจริง</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black/50 rounded-3xl p-2 border border-white/20 shadow-2xl">
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
