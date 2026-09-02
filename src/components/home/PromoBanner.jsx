import React from 'react';
import { Tag, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function PromoBanner({ lang = 'th' }) {
  const { settings } = useSiteSettings();
  const t = translations[lang] || translations.th;

  if (settings.announcement_enabled === false) {
    return null;
  }

  const badge = settings.announcement_badge || t.promoBanner.tag;
  const text = settings.announcement_text || t.promoBanner.text;
  const shippingText = settings.shipping_announcement_text || settings.shipping_badge_text || t.promoBanner.badge;
  const lineUrl = settings.line_url || siteConfig.lineUrl;

  return (
    <div className="bg-sand-950 text-sand-50 text-xs sm:text-sm py-2 px-3 sm:px-4 border-b border-sand-800 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
        
        {/* Left: Announcement / Promo */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="bg-amber-500 text-gray-950 text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded tracking-wide shadow-2xs shrink-0">
            {badge}
          </span>
          <span className="text-sand-200 text-xs sm:text-sm font-medium">
            {text}
          </span>
        </div>

        {/* Right: Secret Packaging Guarantee & LINE */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-sand-300 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate max-w-md">{shippingText}</span>
          </div>

          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-amber-200 transition-colors font-bold flex items-center gap-0.5 shrink-0"
          >
            <span>{t.promoBanner.callLine}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
