import React from 'react';
import { Search, X, Flame, CheckCircle2, Sparkles } from 'lucide-react';
import { translations } from '../../data/translations';

export default function ProductFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalResults,
  isAdultMode,
  onToggleAdultMode,
  lang = 'th'
}) {
  const t = translations[lang] || translations.th;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-sand-200 shadow-soft p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      
      {/* Top Header: Search Bar & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-sand-200">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            className="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 bg-sand-50 border border-sand-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-bronze focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 18+ Toggle Button & Count */}
        <div className="flex items-center gap-2 sm:gap-3 justify-between sm:justify-end shrink-0">
          <button
            onClick={onToggleAdultMode}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200 shadow-2xs whitespace-nowrap ${
              isAdultMode
                ? 'bg-rose-600 border-rose-700 text-white shadow-rose-200'
                : 'bg-sand-50 border-sand-300 text-ink-soft hover:border-rose-400 hover:text-rose-600'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isAdultMode ? 'fill-white' : 'text-rose-500'}`} />
            <span>{isAdultMode ? t.catalog.adultModeActiveBtn : t.catalog.adultModeBtn}</span>
          </button>

          <span className="text-[11px] sm:text-xs text-ink-muted whitespace-nowrap">
            {t.catalog.foundCount} <strong className="text-ink font-bold font-sans">{totalResults}</strong> {t.catalog.itemsUnit}
          </span>
        </div>

      </div>

      {/* "เลือกชมตามหมวดหมู่" Section */}
      <div className="space-y-3 sm:space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-base sm:text-xl font-bold text-ink tracking-tight flex items-center gap-2">
            <span>{t.catalog.searchTitle}</span>
          </h3>
          <span className="text-[11px] text-ink-muted sm:hidden">เลื่อนซ้าย-ขวาเพื่อเลือก ➔</span>
          <div className="h-0.5 flex-1 ml-4 bg-sand-200 hidden sm:block"></div>
        </div>

        {/* Mobile: Horizontal Swipeable Carousel | Desktop: 4-Column Grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none touch-pan-x snap-x">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            
            if (cat.id === 'reviews') {
              return (
                <a
                  key={cat.id}
                  href="#reviews"
                  className="shrink-0 snap-start flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-sand-200 bg-sand-50/70 hover:bg-sand-100 hover:text-bronze text-ink-soft text-xs sm:text-sm font-medium transition-all whitespace-nowrap sm:whitespace-normal"
                >
                  <span>{cat.label}</span>
                  <span className="text-bronze text-xs font-semibold">→</span>
                </a>
              );
            }

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`shrink-0 snap-start flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 text-xs sm:text-sm whitespace-nowrap sm:whitespace-normal active:scale-98 ${
                  isActive
                    ? 'bg-ink text-white border-ink shadow-sm font-semibold'
                    : 'bg-white border-sand-200 text-ink-soft hover:bg-sand-50 hover:border-sand-300 hover:text-ink font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-bronze shrink-0" />}
                  <span className={isActive ? 'underline decoration-bronze underline-offset-4' : ''}>
                    {cat.label}
                  </span>
                </div>
                {cat.count !== undefined && (
                  <span
                    className={`text-[10px] sm:text-[11px] font-sans font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-sand-100 text-ink-muted'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
