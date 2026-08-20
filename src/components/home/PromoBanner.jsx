import React from 'react';
import { Tag, ShieldCheck, ChevronRight } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';

export default function PromoBanner({ lang = 'th' }) {
  const t = translations[lang] || translations.th;

  return (
    <div className="bg-sand-900 text-sand-50 text-xs py-2 px-3 sm:px-4 border-b border-sand-800/80 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
        
        {/* Left: Welcome Promo Code */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="bg-bronze text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider shadow-2xs shrink-0">
            {t.promoBanner.tag}
          </span>
          <span className="text-sand-200 text-[11px] sm:text-xs">
            {t.promoBanner.text}{' '}
            <strong className="text-white font-mono bg-sand-800/90 px-1.5 py-0.5 rounded border border-sand-700 tracking-wider">
              {siteConfig.discountCode}
            </strong>
          </span>
        </div>

        {/* Right: Secret Packaging Guarantee */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-sand-300 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-bronze shrink-0" />
            <span className="truncate max-w-md">{t.promoBanner.badge}</span>
          </div>

          <a
            href={siteConfig.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-bronze transition-colors font-medium flex items-center gap-0.5 shrink-0"
          >
            <span>{t.promoBanner.callLine}</span>
            <ChevronRight className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
