import React from 'react';
import { Shield, Sparkles, MessageCircle, ArrowRight, CheckCircle2, Star, Zap } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import defaultHeroImage from '../../assets/hero-model.webp';

export default function HeroSection({ onExploreClick, lang = 'th' }) {
  const { settings } = useSiteSettings();
  const t = translations[lang] || translations.th;

  const heroTag = settings.hero_tag || t.hero.badge;
  const heroPretitle = settings.hero_pretitle || t.hero.title1;
  const heroTitle = settings.hero_title || t.hero.title2;
  const heroSubtitle = settings.hero_subtitle || t.hero.subtitle;
  const lineUrl = settings.line_url || siteConfig.lineUrl;
  const btnPrimary = settings.hero_btn_primary_text || t.hero.btnCatalog;
  const btnSecondary = settings.hero_btn_secondary_text || t.hero.btnConsult;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sand-100/80 via-sand-50 to-white pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-sand-200">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-200/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Connected Slogan Header Badge */}
        <div className="flex flex-col items-center justify-center text-center pb-8 sm:pb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-amber-300/80 shadow-xs text-xs font-bold text-amber-900 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{heroTag}</span>
          </div>
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] font-extrabold text-bronze">
            {heroPretitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Main Headline */}
            <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-black text-ink leading-[1.18] tracking-tight">
              {heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal whitespace-pre-line">
              {heroSubtitle}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-ink hover:bg-sand-900 text-white text-sm sm:text-base font-bold tracking-wide shadow-soft hover:shadow-soft-hover transition-all duration-200 flex items-center justify-center gap-2.5 group active:scale-98 cursor-pointer"
              >
                <span>{btnPrimary}</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-sand-100 text-ink border border-sand-300 text-sm sm:text-base font-bold tracking-wide shadow-xs transition-all duration-200 flex items-center justify-center gap-2.5"
              >
                <MessageCircle className="w-5 h-5 text-[#06C755]" />
                <span>{btnSecondary}</span>
              </a>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-6 sm:pt-8 border-t border-sand-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{siteConfig.stats.happyClients}</div>
                <div className="text-xs text-ink-muted font-medium">{t.hero.statsOrders}</div>
              </div>
              <div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{siteConfig.stats.satisfaction}</div>
                <div className="text-xs text-ink-muted font-medium">{t.hero.statsRating}</div>
              </div>
              <div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{siteConfig.stats.privacy}</div>
                <div className="text-xs text-ink-muted font-medium">{t.hero.statsDiscreet}</div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400/30 to-rose-400/20 rounded-3xl blur-xl" />

              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-modal border-2 border-sand-300 bg-sand-200 group">
                <img
                  src={settings.hero_bg_image && !settings.hero_bg_image.includes('7ee33a0f-4684-42bb-b140-e282b3df64a3.jpg') ? settings.hero_bg_image : defaultHeroImage}
                  alt="RUBBER DOLL THAILAND ตุ๊กตายางพรีเมียม ซิลิโคนแท้"
                  title="RUBBER DOLL THAILAND ตุ๊กตายางพรีเมียม ซิลิโคนแท้"
                  width="600"
                  height="800"
                  loading="eager"
                  fetchpriority="high"
                  decoding="sync"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://cdn.zyrosite.com/cdn-ecommerce/store_01KYYQFNVFQMCAMTY5SZA4J5H8/assets/7ee33a0f-4684-42bb-b140-e282b3df64a3.jpg";
                  }}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
                />

                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-sand-200 shadow-soft flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-ink">{settings.trust_discrete_title || '100% Secret Packaging'}</div>
                      <div className="text-[11px] text-ink-muted">ไม่ระบุชื่อสินค้าหน้ากล่องพัสดุ</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    VERIFIED
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
