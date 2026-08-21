import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ShieldCheck, Sparkles, Box, Check, Star, Lock, HeartHandshake, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';

export default function ProductModal({ product, onClose, isAdultMode, lang = 'th' }) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const t = translations[lang] || translations.th;

  useEffect(() => {
    setActiveImageIdx(0);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [product, onClose]);

  if (!product) return null;

  const galleryImages = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image, product.secondaryImage].filter(Boolean);

  const currentImage = galleryImages[activeImageIdx] || product.image;

  const lineMessage = `สวัสดีครับ สนใจสอบถามและสั่งซื้อสินค้า [${product.code}] ${product.name} สเปก ${product.height} ครับ`;
  const lineProductUrl = `https://line.me/R/oaMessage/@RUBBERDOLL.TH/?${encodeURIComponent(lineMessage)}`;
  const seoImageAlt = `ตุ๊กตายาง ซิลิโคนแท้ระดับ Hi-End รุ่น ${product.code} ${product.name} ${product.series} สเปก ${product.height} RUBBER DOLL THAILAND`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
      
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card / Mobile Bottom Sheet */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-modal border border-sand-200 z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 pb-20 sm:pb-0">
        
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-sand-300 rounded-full mx-auto my-3" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur-md text-ink-muted hover:text-ink hover:bg-sand-100 transition-colors shadow-2xs border border-sand-200"
          aria-label="ปิดหน้าต่าง / Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 p-4 sm:p-6 lg:p-8">
          
          {/* Left: Product Image & Gallery Thumbnails */}
          <div className="md:col-span-6 space-y-3">
            
            {/* Main Featured Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-sand-100 border border-sand-200 shadow-sm">
              <img
                src={currentImage}
                alt={seoImageAlt}
                title={seoImageAlt}
                width="600"
                height="800"
                className="w-full h-full object-cover object-top transition-all duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = product.image || '/favicon.png';
                }}
              />
              <div className="absolute top-3 left-3 bg-white/95 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-sans font-extrabold text-ink shadow-2xs border border-sand-200">
                {product.code}
              </div>

              {isAdultMode && (
                <div className="absolute top-3 right-3 bg-rose-600 text-white px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-2xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" /> {t.modal.adultBadge}
                </div>
              )}

              {/* Angle Switcher arrows if multiple images */}
              {galleryImages.length > 1 && (
                <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-white/85 backdrop-blur-md text-ink hover:bg-white pointer-events-auto shadow-sm transition-transform active:scale-95"
                    title="รูปก่อนหน้า / Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-white/85 backdrop-blur-md text-ink hover:bg-white pointer-events-auto shadow-sm transition-transform active:scale-95"
                    title="รูปถัดไป / Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 bg-ink/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] p-1.5 sm:p-2 rounded-xl text-center">
                {t.modal.factoryPhotos} {activeImageIdx + 1} / {galleryImages.length} • {t.modal.medicalGrade}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-12 sm:w-14 h-14 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIdx === idx
                        ? 'border-bronze shadow-sm scale-105'
                        : 'border-sand-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Angle ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = product.image || '/favicon.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right: Technical Specs & Details */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-6">
            
            <div className="space-y-3 sm:space-y-4">
              
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-bronze uppercase tracking-wider">
                  <span>{product.series}</span>
                  <span>•</span>
                  <span>{product.category}</span>
                </div>
                <h2 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold text-ink mt-0.5">
                  {product.code} {product.name}
                </h2>
              </div>

              {/* Description */}
              <div className="p-3 sm:p-4 rounded-xl bg-sand-50 border border-sand-200/80 text-xs text-ink-soft leading-relaxed font-light">
                {product.description}
              </div>

              {/* Specs Table */}
              <div className="space-y-1.5 sm:space-y-2">
                <h4 className="text-[11px] sm:text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-bronze" /> {t.modal.specsTitle}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-sand-100/70 border border-sand-200">
                    <span className="text-ink-muted block text-[10px]">{t.modal.height}</span>
                    <span className="font-sans font-bold text-ink">{product.height}</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg bg-sand-100/70 border border-sand-200">
                    <span className="text-ink-muted block text-[10px]">{t.modal.weight}</span>
                    <span className="font-sans font-bold text-ink">{product.weight}</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg bg-sand-100/70 border border-sand-200 col-span-2">
                    <span className="text-ink-muted block text-[10px]">{t.modal.material}</span>
                    <span className="font-sans font-bold text-ink text-[11px] sm:text-xs">{t.modal.materialValue}</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg bg-sand-100/70 border border-sand-200 col-span-2">
                    <span className="text-ink-muted block text-[10px]">{t.modal.skeleton}</span>
                    <span className="font-sans font-bold text-ink text-[11px] sm:text-xs">{t.modal.skeletonValue}</span>
                  </div>
                </div>
              </div>

              {/* In The Box */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] sm:text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-bronze" /> {t.modal.boxTitle}
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-ink-soft">
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-700" /> {t.modal.box1}</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-700" /> {t.modal.box2}</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-700" /> {t.modal.box3}</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-700" /> {t.modal.box4}</li>
                </ul>
              </div>

            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-3 sm:pt-4 border-t border-sand-200">
              <a
                href={lineProductUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-98"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span>{t.modal.orderBtn}</span>
              </a>

              <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] text-ink-muted">
                <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-700" /> {t.modal.discreet}</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-bronze" /> {t.modal.warranty}</span>
                <span className="flex items-center gap-1"><HeartHandshake className="w-3 h-3 text-ink-soft" /> {t.modal.support}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
