import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ShieldCheck, Sparkles, Box, Check, Star, Lock, HeartHandshake, ChevronLeft, ChevronRight, Flame, Layers, DollarSign, Gift, CheckCircle2, FileText } from 'lucide-react';
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

  const lineMessage = `สวัสดีครับ สนใจสอบถามและสั่งซื้อสินค้า [${product.code}] ${product.name} (ราคา: ${product.price || 'โปรโมชั่น'}, สเปก: ${product.height || '-'}) ครับ`;
  const lineProductUrl = `https://line.me/R/oaMessage/@RUBBERDOLL.TH/?${encodeURIComponent(lineMessage)}`;
  const seoImageAlt = `ตุ๊กตายาง ซิลิโคนแท้ระดับ Hi-End รุ่น ${product.code} ${product.name} ${product.series} สเปก ${product.height} RUBBER DOLL THAILAND`;

  const skinTone = product.skinTone || product.skin_tone || 'ผิวขาว/สีขาวเหลือง';
  const material = product.material || 'Pure Silicone + ปลูกผมและคิ้วเสมือนจริงเส้นต่อเส้น';
  const skeleton = product.skeleton || 'EVO Stainless-Steel 360° Articulated Frame';
  const specialOption = product.specialOption || product.special_option || '';
  const originalPrice = product.originalPrice || product.original_price || '';
  const gifts = product.gifts || 'ชุดแฟชั่นสั่งตัดตามสไตล์โมเดล, วิกผมเกรดพรีเมียม สัมผัสนุ่มลื่น, แป้งฝุ่นบำรุงผิว Silky Smooth Powder, เซ็ตอุปกรณ์ทำความสะอาดและดูแลรักษาครบวงจร';

  const giftsList = gifts.split(',').map(g => g.trim()).filter(Boolean);

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

              {/* Angle Switcher arrows */}
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
                ภาพถ่ายสเปกจริงจากโรงงาน {activeImageIdx + 1} / {galleryImages.length} • Hyper-Realistic Pure Silicone SSS
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
            
            <div className="space-y-4">
              
              {/* Header: Series & Category */}
              <div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-bronze uppercase tracking-wider">
                  <span>{product.series || 'ตุ๊กตายางพรีเมียม'}</span>
                  <span>•</span>
                  <span>{product.category || 'ตุ๊กตาซิลิโคนแท้'}</span>
                </div>
                <h2 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold text-ink mt-0.5">
                  {product.code} {product.name}
                </h2>
              </div>

              {/* Price & Special Option Banner */}
              <div className="p-3.5 bg-sand-50 rounded-2xl border border-sand-200 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-ink-muted">ราคาพิเศษ:</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-800 font-sans">
                      {product.price || 'ติดต่อสอบถามทาง LINE'}
                    </span>
                  </div>
                  {originalPrice && (
                    <span className="text-xs text-ink-muted line-through font-sans">
                      {originalPrice}
                    </span>
                  )}
                </div>

                {specialOption && (
                  <div className="pt-1 text-xs text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 border border-amber-300/60">
                    <span>📋</span>
                    <span>{specialOption}</span>
                  </div>
                )}
              </div>

              {/* Beautiful Multiline Formatted Description */}
              {product.description && (
                <div className="p-3.5 sm:p-4 bg-sand-50/80 rounded-2xl border border-sand-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink border-b border-sand-200/80 pb-1.5">
                    <FileText className="w-3.5 h-3.5 text-bronze" />
                    <span>รายละเอียดสินค้าเพิ่มเติม</span>
                  </div>
                  <div className="text-xs sm:text-sm text-ink-soft leading-relaxed whitespace-pre-line font-normal">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Technical Specifications (Clean 2-Column Symmetrical Layout) */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-bronze" />
                  <span>ข้อมูลสเปกความพรีเมียม (SPECIFICATIONS)</span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-sand-50/90 border border-sand-200/80 flex flex-col justify-between">
                    <span className="text-[11px] text-ink-muted">ส่วนสูง (Height)</span>
                    <span className="font-bold font-sans text-xs sm:text-sm text-ink pt-0.5">{product.height || '-'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-sand-50/90 border border-sand-200/80 flex flex-col justify-between">
                    <span className="text-[11px] text-ink-muted">น้ำหนัก (Weight)</span>
                    <span className="font-bold font-sans text-xs sm:text-sm text-ink pt-0.5">{product.weight || '-'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-sand-50/90 border border-sand-200/80 flex flex-col justify-between">
                    <span className="text-[11px] text-ink-muted">สีผิว (Skin Tone)</span>
                    <span className="font-bold text-xs sm:text-sm text-ink pt-0.5">{skinTone}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-sand-50/90 border border-sand-200/80 flex flex-col justify-between">
                    <span className="text-[11px] text-ink-muted">วัสดุเนื้อผิวตุ๊กตา</span>
                    <span className="font-bold text-xs sm:text-sm text-ink pt-0.5">{material}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-sand-50/90 border border-sand-200/80 space-y-0.5">
                  <span className="text-[11px] text-ink-muted block">โครงสร้างข้อต่อ (Articulation)</span>
                  <span className="font-bold text-xs sm:text-sm text-ink">{skeleton}</span>
                </div>
              </div>

              {/* Free Gifts & Collector Box */}
              {giftsList.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                    <Gift className="w-4 h-4 text-bronze" />
                    <span>THE LUXURY COLLECTOR BOX (เซ็ตของขวัญระดับพรีเมียม)</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-ink-soft">
                    {giftsList.map((gift, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{gift}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Sticky Action Button */}
            <div className="space-y-2 pt-3 border-t border-sand-200">
              <a
                href={lineProductUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>สั่งซื้อ / สอบถามรุ่นนี้แบบ Private LINE</span>
              </a>

              <div className="flex items-center justify-center gap-4 text-[10px] text-ink-muted">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> ส่งลับเฉพาะ 100%
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> ประกันคืนเงิน 100%
                </span>
                <span className="flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3 text-emerald-600" /> ดูแลส่วนตัว 24 ชม.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
