import React from 'react';
import { MessageCircle, Search, Sparkles, Flame, Globe } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';

export default function StickyMobileBar({ onSearchClick, isAdultMode, onToggleAdultMode, lang = 'th', onSetLang }) {
  const t = translations[lang] || translations.th;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 sm:hidden bg-sand-900/95 backdrop-blur-lg border border-sand-700/80 p-2 rounded-2xl shadow-2xl flex items-center justify-between gap-1.5 text-white">
      
      {/* 1. Explore Catalog */}
      <button
        onClick={onSearchClick}
        className="flex-1 py-2 px-2 rounded-xl bg-sand-800/80 hover:bg-sand-700 text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
      >
        <Search className="w-4 h-4 text-bronze" />
        <span>{lang === 'th' ? 'ค้นหา/รุ่น' : 'Catalog'}</span>
      </button>

      {/* 2. 18+ Mode Toggle */}
      <button
        onClick={onToggleAdultMode}
        className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all ${
          isAdultMode
            ? 'bg-rose-600 text-white shadow-rose-900 shadow-md'
            : 'bg-sand-800/80 text-sand-200'
        }`}
      >
        <Flame className={`w-4 h-4 ${isAdultMode ? 'fill-white' : 'text-rose-400'}`} />
        <span>{isAdultMode ? '18+ ON' : '18+ OFF'}</span>
      </button>

      {/* 3. Language Switch */}
      <button
        onClick={() => onSetLang(lang === 'th' ? 'en' : 'th')}
        className="flex-1 py-2 px-2 rounded-xl bg-sand-800/80 hover:bg-sand-700 text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
      >
        <Globe className="w-4 h-4 text-sand-300" />
        <span>{lang === 'th' ? 'EN 🇬🇧' : 'TH 🇹🇭'}</span>
      </button>

      {/* 4. LINE Direct Order */}
      <a
        href={siteConfig.lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1.5 py-2.5 px-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
      >
        <MessageCircle className="w-4 h-4 fill-white shrink-0" />
        <span>{lang === 'th' ? 'แชท LINE' : 'LINE'}</span>
      </a>

    </div>
  );
}
