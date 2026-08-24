import React from 'react';
import { Shield, Sparkles, MessageCircle, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function HeroSection({ onExploreClick, lang = 'th' }) {
  const { settings } = useSiteSettings();
  const t = translations[lang] || translations.th;

  const heroTag = settings.hero_tag || t.hero.badge;
  const heroTitle = settings.hero_title || t.hero.title2;
  const heroSubtitle = settings.hero_subtitle || t.hero.subtitle;
  const lineUrl = settings.line_url || siteConfig.lineUrl;
  const btnPrimary = settings.hero_btn_primary_text || t.hero.btnCatalog;
  const btnSecondary = settings.hero_btn_secondary_text || t.hero.btnConsult;

  return (
    <section className="relative overflow-hidden bg-sand-100/50 pt-12 pb-16 sm:pt-20 sm:pb-28 border-b border-sand-200">
      
      {/* Background Decorative Blurs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-sand-300/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sand-300/80 shadow-2xs text-xs font-medium text-ink-soft">
              <Sparkles className="w-3.5 h-3.5 text-bronze" />
              <span>{heroTag}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-bronze">
                {t.hero.title1}
              </p>
              <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-bold text-ink leading-[1.15] tracking-tight">
                {heroTitle}
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-ink-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light whitespace-pre-line">
              {heroSubtitle}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-ink hover:bg-sand-900 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-soft hover:shadow-soft-hover transition-all duration-200 flex items-center justify-center gap-2 group active:scale-98"
              >
                <span>{btnPrimary}</span>
                <ArrowRight className="w-4 h-4 text-bronze group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-sand-100 text-ink border border-sand-300 text-xs sm:text-sm font-semibold tracking-wide shadow-2xs transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#06C755]" />
                <span>{btnSecondary}</span>
              </a>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-8 border-t border-sand-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{siteConfig.stats.happyClients}</div>
                <div className="text-[11px] text-ink-muted font-light">{t.hero.statsOrders}</div>
              </div>
              <div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{siteConfig.stats.satisfaction}</div>
                <div className="text-[11px] text-ink-muted font-light">{t.hero.statsRating}</div>
              </div>
              <div>
                <div className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{siteConfig.stats.privacy}</div>
                <div className="text-[11px] text-ink-muted font-light">{t.hero.statsDiscreet}</div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-2 bg-gradient-to-tr from-bronze/20 to-sand-300/40 rounded-3xl blur-xl" />

              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-modal border border-sand-300 bg-sand-200">
                <img
                  src={settings.hero_bg_image || "https://cdn.zyrosite.com/cdn-ecommerce/store_01KYYQFNVFQMCAMTY5SZA4J5H8/assets/7ee33a0f-4684-42bb-b140-e282b3df64a3.jpg"}
                  alt="RUBBER DOLL THAILAND ตุ๊กตายางพรีเมียม ซิลิโคนแท้"
                  title="RUBBER DOLL THAILAND ตุ๊กตายางพรีเมียม ซิลิโคนแท้"
                  width="600"
                  height="800"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
                />

                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-sand-200 shadow-soft flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink">{settings.trust_discrete_title || '100% Secret Packaging'}</div>
                      <div className="text-[10px] text-ink-muted">ไม่ระบุชื่อสินค้าหน้ากล่องพัสดุ</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
