import React, { useState } from 'react';
import { MessageCircle, Search, Menu, X, Flame } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';

export default function Navbar({ onSearchClick, isAdultMode, onToggleAdultMode, lang, onSetLang }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang] || translations.th;

  // Primary 4 curated links for luxury clean header
  const desktopLinks = [
    { id: 'catalog', label: lang === 'th' ? 'คอลเลกชัน 70 รุ่น' : '70 Models', href: '#catalog' },
    { id: 'ready', label: lang === 'th' ? 'พร้อมส่งทันที (ไทย)' : 'Ready Stock (TH)', href: '#catalog' },
    { id: 'discreet', label: lang === 'th' ? 'จัดส่งลับเฉพาะ' : 'Discreet Box', href: '#discreet' },
    { id: 'reviews', label: lang === 'th' ? 'รีวิวลูกค้า' : 'Reviews', href: '#reviews' },
    { id: 'faq', label: lang === 'th' ? 'คำถามพบบ่อย' : 'FAQ', href: '#faq' },
  ];

  const allDrawerLinks = [
    { id: 'catalog', label: lang === 'th' ? 'คอลเลกชัน 70 รุ่น ทั้งหมด' : 'All 70 Models Collection', href: '#catalog' },
    { id: 'ready', label: lang === 'th' ? 'สินค้าพร้อมส่งทันทีในไทย (23 รายการ)' : 'Ready to Ship in Thailand (23 Items)', href: '#catalog' },
    { id: 'discreet', label: lang === 'th' ? 'นโยบายจัดส่งลับเฉพาะ 100% (Secret Box)' : '100% Secret & Discreet Shipping', href: '#discreet' },
    { id: 'care', label: lang === 'th' ? 'ศิลปะการดูแลรักษา (The Longevity Care)' : 'Care & Maintenance Guide', href: '#care' },
    { id: 'reviews', label: lang === 'th' ? 'รีวิวความประทับใจจากคอลเลกเตอร์' : 'Verified Collector Reviews', href: '#reviews' },
    { id: 'faq', label: lang === 'th' ? 'คำถามที่พบบ่อย (FAQ & Guide)' : 'Frequently Asked Questions (FAQ)', href: '#faq' },
    { id: 'contact', label: lang === 'th' ? 'ติดต่อ Private Advisor (LINE 24 ชม.)' : 'Contact Private Advisor (LINE 24/7)', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-sand-50/95 backdrop-blur-md border-b border-sand-200/90 w-full transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: Brand Logo Lockup */}
          <a href="#" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo.png"
              alt="RUBBER DOLL THAILAND Official Logo"
              width="44"
              height="44"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-2xs border border-sand-200 group-hover:border-bronze transition-colors shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-ink group-hover:text-bronze transition-colors whitespace-nowrap">
                  RUBBER DOLL
                </span>
                <span className="text-[10px] font-sans font-bold tracking-widest px-1.5 py-0.5 rounded bg-sand-200 text-bronze-dark shrink-0">
                  TH
                </span>
              </div>
              <span className="text-[10px] text-ink-muted tracking-widest uppercase font-medium whitespace-nowrap">
                {t.nav.est}
              </span>
            </div>
          </a>

          {/* Center: Desktop Navigation Links (Only on large screens to prevent ANY overlap) */}
          <nav className="hidden 2xl:flex items-center space-x-1 shrink-0">
            {desktopLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="px-3 py-2 rounded-xl text-sm font-medium text-ink-soft hover:text-bronze hover:bg-sand-100/80 transition-all duration-150 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Laptop Navigation Links (Top 3 on medium laptops) */}
          <nav className="hidden lg:flex 2xl:hidden items-center space-x-1 shrink-0">
            {desktopLinks.slice(0, 3).map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-soft hover:text-bronze hover:bg-sand-100/80 transition-all duration-150 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Action Buttons (Always cleanly separated) */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Segmented TH | EN Language Switcher */}
            <div className="flex items-center bg-sand-200/80 p-1 rounded-full border border-sand-300 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => onSetLang('th')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                  lang === 'th'
                    ? 'bg-white text-ink shadow-xs scale-102'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="ภาษาไทย"
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => onSetLang('en')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                  lang === 'en'
                    ? 'bg-white text-ink shadow-xs scale-102'
                    : 'text-ink-muted hover:text-ink'
                }`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* 18+ Mode Toggle */}
            <button
              onClick={onToggleAdultMode}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200 shadow-2xs shrink-0 whitespace-nowrap ${
                isAdultMode
                  ? 'bg-rose-600 border-rose-700 text-white shadow-rose-200'
                  : 'bg-white/90 border-sand-300 text-ink-soft hover:border-rose-400 hover:text-rose-600'
              }`}
              title={isAdultMode ? t.nav.adultModeActive : t.nav.adultMode}
            >
              <Flame className={`w-3.5 h-3.5 ${isAdultMode ? 'fill-white' : 'text-rose-500'}`} />
              <span className="hidden sm:inline">{isAdultMode ? t.nav.adultModeActive : t.nav.adultMode}</span>
              <span className="sm:hidden">{isAdultMode ? '18+ ON' : '18+'}</span>
            </button>

            {/* Search Trigger */}
            <button
              onClick={onSearchClick}
              className="p-2 sm:px-3 sm:py-2 rounded-full text-ink-soft hover:text-ink hover:bg-sand-200 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium border border-sand-300 bg-white/80 shadow-2xs shrink-0"
              title="ค้นหารหัสสินค้า / Search"
            >
              <Search className="w-3.5 h-3.5 text-ink-muted" />
              <span className="hidden xl:inline text-ink-muted text-xs">{t.nav.searchPlaceholder}</span>
            </button>

            {/* LINE CTA */}
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 bg-[#06C755] hover:bg-[#05b34c] text-white px-4 py-2 rounded-full text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all duration-200 active:scale-95 shrink-0 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{t.nav.chatLine}</span>
            </a>

            {/* Mobile / Laptop Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="2xl:hidden p-2.5 rounded-xl text-ink hover:bg-sand-200 transition-colors shrink-0"
              aria-label="เมนู / Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Drawer Menu */}
      {mobileMenuOpen && (
        <div className="2xl:hidden bg-sand-50 border-b border-sand-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-1.5 bg-white rounded-2xl border border-sand-200 flex items-center justify-center gap-1">
              <button
                onClick={() => onSetLang('th')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  lang === 'th' ? 'bg-ink text-white shadow-xs' : 'text-ink-muted'
                }`}
              >
                ไทย (TH)
              </button>
              <button
                onClick={() => onSetLang('en')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-ink text-white shadow-xs' : 'text-ink-muted'
                }`}
              >
                English (EN)
              </button>
            </div>

            <button
              onClick={onToggleAdultMode}
              className={`p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                isAdultMode ? 'bg-rose-600 text-white' : 'bg-white border border-sand-200 text-ink-soft'
              }`}
            >
              <Flame className={`w-4 h-4 ${isAdultMode ? 'fill-white' : 'text-rose-500'}`} />
              <span>{isAdultMode ? t.nav.adultModeActive : t.nav.adultMode}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1 pt-1">
            {allDrawerLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-ink-soft hover:bg-sand-100 hover:text-bronze transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-sand-400 text-xs">→</span>
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-sand-200 flex flex-col gap-2">
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#06C755] text-white py-3 rounded-xl text-sm font-semibold shadow"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{t.nav.chatLine} (@{siteConfig.lineId})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
