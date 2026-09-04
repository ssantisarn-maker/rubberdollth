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
            alt={`${seoImageAlt} (${settings.card_angles_unit || t.catalog.card.anglesUnit})`}
            title={`${seoImageAlt} (${settings.card_angles_unit || t.catalog.card.anglesUnit})`}
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
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-2xs">
              {settings.card_ready_badge || (lang === 'th' ? 'พร้อมส่ง (ไทย)' : 'Ready')}
            </span>
          )}
        </div>

        {/* Top Right: Video Badge, 18+ Mode or Height */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 pointer-events-none z-10">
          {((product.videoUrls && product.videoUrls.length > 0) || (product.video_urls && product.video_urls.length > 0) || product.videoUrl || product.video_url) && (
            <span className="bg-purple-700 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1 animate-pulse">
              ▶ วิดีโอ {((product.videoUrls?.length || product.video_urls?.length || 0) > 1) ? `(${product.videoUrls?.length || product.video_urls?.length})` : ''}
            </span>
          )}
          {isAdultMode ? (
            <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" /> {settings.card_adult_badge || '18+'}
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" />
              <span>{gallery.length} {settings.card_angles_unit || t.catalog.card.anglesUnit}</span>
            </span>
          )}
        </div>

        {/* Quick View Button Hover Overlay (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-end justify-center">
          <span className="text-white text-xs font-semibold px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            <span>{settings.card_quickview_btn_text || t.catalog.card.quickView}</span>
          </span>
        </div>

      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
            <span className="text-bronze font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] truncate">
              {product.series}
            </span>
            <span className="text-[10px] sm:text-xs font-medium font-sans shrink-0 ml-1">
              {product.height} cm
            </span>
          </div>

          <h3 className="font-sans font-bold text-xs sm:text-sm text-ink group-hover:text-bronze transition-colors line-clamp-1">
            {product.name}
          </h3>

          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-bold text-ink tracking-tight">
              {product.price || settings.card_ask_price_text || t.catalog.card.priceInquire}
            </span>
            {originalPrice && (
              <span className="text-[10px] sm:text-xs text-ink-muted line-through font-normal">
                {originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Specs & Order */}
        <div className="pt-2 border-t border-sand-100 flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onQuickView(product)}
            className="flex-1 py-2 sm:py-2.5 px-3 bg-sand-100 hover:bg-sand-200 text-ink rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-colors active:scale-98 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-ink-muted" />
            <span>{settings.card_specs_btn_text || t.catalog.card.specsBtn}</span>
          </button>

          <a
            href={lineProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 sm:py-2.5 px-3.5 sm:px-4 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-colors shadow-2xs active:scale-98 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{settings.card_order_btn_text || t.catalog.card.orderBtn}</span>
          </a>
        </div>

      </div>

    </article>
  );
}
