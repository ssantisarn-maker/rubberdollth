import React, { useState } from 'react';
import { Eye, MessageCircle, Layers, Flame, Tag } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function ProductCard({ product, onQuickView, isAdultMode, lang = 'th', priority = false }) {
  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const [hoverLoaded, setHoverLoaded] = useState(false);
  const { settings } = useSiteSettings();
  const t = translations[lang] || translations.th;

  // Gallery determination
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const displayMainImg = isAdultMode && gallery.length > 1 ? gallery[1] : gallery[0];
  const displayHoverImg = isAdultMode ? (gallery.length > 2 ? gallery[2] : gallery[0]) : (gallery.length > 1 ? gallery[1] : null);

  const hasHover = Boolean(displayHoverImg && displayHoverImg !== displayMainImg);

  const lineProductUrl = settings.line_url || siteConfig.lineUrl || 'https://line.me/R/ti/p/@RUBBERDOLL.TH';

  const seoImageAlt = `ตุ๊กตายาง ซิลิโคนแท้ระดับ Hi-End รุ่น ${product.code} ${product.name} ${product.series} สเปก ${product.height} RUBBER DOLL THAILAND`;

  const originalPrice = product.originalPrice || product.original_price || '';

  return (
    <article className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
      isAdultMode 
        ? 'border-rose-300/80 shadow-soft hover:shadow-rose-100 hover:border-rose-400' 
        : 'border-sand-200 shadow-soft hover:shadow-soft-hover'
    }`}>
      
      {/* Image Container with Hover Swap Effect */}
      <div
        className="relative aspect-[3/4] bg-sand-100 overflow-hidden cursor-pointer select-none"
        onClick={() => onQuickView(product)}
      >
        
        {/* Placeholder skeleton */}
        {!primaryLoaded && (
          <div className="absolute inset-0 bg-sand-200/60 animate-pulse flex items-center justify-center">
            <span className="text-[10px] sm:text-xs text-ink-muted">{t.catalog.card.loading}</span>
          </div>
        )}

        {/* 1. Main Display Image */}
        <img
          key={displayMainImg}
          src={displayMainImg}
          alt={seoImageAlt}
          title={seoImageAlt}
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority ? 'high' : 'low'}
          decoding={priority ? 'sync' : 'async'}
          width="400"
          height="533"
          onLoad={() => setPrimaryLoaded(true)}
          className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
            primaryLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/favicon.png';
          }}
        />

        {/* 2. Hover Image (Desktop cross-fade) */}
        {hasHover && (
          <img
            key={displayHoverImg}
            src={displayHoverImg}
            alt={`${seoImageAlt} (${t.catalog.card.anglesUnit})`}
            title={`${seoImageAlt} (${t.catalog.card.anglesUnit})`}
            loading="lazy"
            decoding="async"
            width="400"
            height="533"
            onLoad={() => setHoverLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out transform group-hover:scale-105 hidden sm:block"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/favicon.png';
            }}
          />
        )}

        {/* Top Left Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 items-start pointer-events-none z-10">
          <span className="bg-white/95 backdrop-blur-md px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-sans font-extrabold text-ink shadow-2xs border border-sand-200/60 tracking-wider">
            {product.code}
          </span>
          {product.isReadyToShip && (
            <span className="bg-emerald-600 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium shadow-2xs">
              {lang === 'th' ? 'พร้อมส่ง' : 'Ready'}
            </span>
          )}
        </div>

        {/* Top Right: Video Badge, 18+ Mode or Height */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 pointer-events-none z-10">
          {(product.videoUrl || product.video_url) && (
            <span className="bg-purple-700 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1 animate-pulse">
              ▶ วิดีโอ
            </span>
          )}
          {isAdultMode ? (
            <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" /> 18+
            </span>
          ) : (
            hasHover && (
              <span className="bg-white/90 backdrop-blur-md text-ink text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs hidden sm:flex items-center gap-1 opacity-90 group-hover:opacity-0 transition-opacity">
                <Layers className="w-2.5 h-2.5 text-bronze" /> {gallery.length}
              </span>
            )
          )}
          <span className="bg-ink/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-sans font-semibold">
            {product.height}
          </span>
        </div>

        {/* Desktop Quick View Overlay */}
        <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2 p-4 pointer-events-none z-10">
          <button
            type="button"
            className="bg-white/95 backdrop-blur-md text-ink text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 pointer-events-auto hover:bg-sand-100"
          >
            <Eye className="w-3.5 h-3.5 text-bronze" />
            <span>{t.catalog.card.quickView}</span>
          </button>
        </div>

      </div>

      {/* Card Info */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
        
        <div className="space-y-1.5">
          {/* Series & Category */}
          <div className="text-[10px] sm:text-[11px] text-ink-muted">
            <span className="truncate block">{product.category}</span>
          </div>

          {/* Model Name */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-sans text-sm sm:text-base font-bold text-ink group-hover:text-bronze transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Price Display Directly on Product Card */}
          <div className="flex items-baseline justify-between gap-1 pt-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-[11px] font-bold text-emerald-800 font-sans">
                {product.price || 'ติดต่อทาง LINE'}
              </span>
            </div>
            {originalPrice && (
              <span className="text-[10px] text-ink-muted line-through font-sans">
                {originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-sand-100 flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onQuickView(product)}
            className="flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl border border-sand-300 text-[11px] sm:text-xs font-medium text-ink-soft hover:bg-sand-100 hover:text-ink transition-colors text-center"
          >
            {t.catalog.card.specsBtn}
          </button>

          <a
            href={lineProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 sm:py-2 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl bg-[#05963c] hover:bg-[#047830] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
            title="สั่งซื้อผ่าน LINE / Order via LINE"
          >
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
            <span>{t.catalog.card.orderBtn}</span>
          </a>
        </div>

      </div>

    </article>
  );
}
