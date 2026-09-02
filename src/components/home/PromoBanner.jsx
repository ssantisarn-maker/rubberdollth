import React from 'react';
import { Sparkles, ChevronRight, MessageCircle } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function PromoBanner({ lang = 'th' }) {
  const { settings } = useSiteSettings();
  const t = translations[lang] || translations.th;

  if (settings.announcement_enabled === false) {
    return null;
  }

  const badge = settings.announcement_badge || t.promoBanner.tag || '🔥 โปรโมชั่นพิเศษ';
  const text = settings.announcement_text || t.promoBanner.text || 'สต็อกพร้อมส่งในไทย! สั่งซื้อวันนี้รับฟรี The Luxury Collector Box';
  const lineUrl = settings.line_url || siteConfig.lineUrl || 'https://line.me/R/ti/p/@RUBBERDOLL.TH';
  const ctaText = settings.announcement_cta || 'สอบถามโปรโมชั่นทาง LINE';

  return (
    <div className="bg-sand-950 text-sand-50 text-xs sm:text-sm py-2 px-3 sm:px-4 border-b border-sand-800 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-center sm:text-left">
        
        {/* Left: Promotional Announcement */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <span className="bg-amber-500 text-gray-950 text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded tracking-wide shadow-2xs shrink-0">
            {badge}
          </span>
          <span className="text-sand-200 text-xs sm:text-sm font-semibold">
            {text}
          </span>
        </div>

        {/* Right: Promotion Action Link */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-amber-200 transition-colors font-bold text-xs flex items-center gap-1 shrink-0 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full border border-amber-400/30"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>{ctaText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
