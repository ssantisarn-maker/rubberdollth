import React, { useState } from 'react';
import { MessageCircle, Search, Menu, X, Flame, Bell, Phone } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useLiveProducts } from '../../hooks/useLiveProducts';

export default function Navbar({ onSearchClick, isAdultMode, onToggleAdultMode, lang, onSetLang }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useSiteSettings();
  const { products } = useLiveProducts();
  const t = translations[lang] || translations.th;

  const productCount = products && products.length > 0 ? products.length : 70;
  const lineUrl = settings.line_url || siteConfig.lineUrl;
  const lineId = settings.line_id || siteConfig.lineId;

  // Primary curated links
  const desktopLinks = [
    { id: 'catalog', label: lang === 'th' ? `คอลเลกชัน ${productCount} รุ่น` : `${productCount} Models`, href: '#catalog' },
    { id: 'ready', label: lang === 'th' ? 'พร้อมส่งทันที (ไทย)' : 'Ready Stock (TH)', href: '#catalog' },
    { id: 'discreet', label: lang === 'th' ? 'จัดส่งลับเฉพาะ' : 'Discreet Box', href: '#discreet' },
    { id: 'reviews', label: lang === 'th' ? 'รีวิวลูกค้า' : 'Reviews', href: '#reviews' },
    { id: 'faq', label: lang === 'th' ? 'คำถามพบบ่อย' : 'FAQ', href: '#faq' },
  ];

  const allDrawerLinks = [
    { id: 'catalog', label: lang === 'th' ? `คอลเลกชัน ${productCount} รุ่น ทั้งหมด` : `All ${productCount} Models Collection`, href: '#catalog' },
    { id: 'ready', label: lang === 'th' ? 'สินค้าพร้อมส่งทันทีในไทย (ด่วน 1-2 วัน)' : 'Ready to Ship in Thailand (Express)', href: '#catalog' },
    { id: 'discreet', label: lang === 'th' ? 'นโยบายจัดส่งลับเฉพาะ 100% (Secret Box)' : '100% Secret & Discreet Shipping', href: '#discreet' },
    { id: 'care', label: lang === 'th' ? 'ศิลปะการดูแลรักษา (The Longevity Care)' : 'Care & Maintenance Guide', href: '#care' },
    { id: 'reviews', label: lang === 'th' ? 'รีวิวความประทับใจจากคอลเลกเตอร์' : 'Verified Collector Reviews', href: '#reviews' },
    { id: 'faq', label: lang === 'th' ? 'คำถามที่พบบ่อย (FAQ & Guide)' : 'Frequently Asked Questions (FAQ)', href: '#faq' },
    { id: 'contact', label: lang === 'th' ? 'ติดต่อ Private Advisor (LINE 24 ชม.)' : 'Contact Private Advisor (LINE 24/7)', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      
      {/* Top Announcement Bar (Live Controlled from Admin CMS) */}
      {settings.announcement_enabled && (
        <div className="bg-ink text-sand-100 px-4 py-2 text-xs border-b border-sand-800 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 mx-auto sm:mx-0">
              {settings.announcement_badge && (
                <span className="bg-amber-500 text-gray-950 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shrink-0 shadow-xs">
                  {settings.announcement_badge}
                </span>
              )}
              <span className="text-[11px] sm:text-xs font-normal text-sand-200 line-clamp-1">
                {settings.announcement_text}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-[11px] text-sand-400 shrink-0">
              <a href={lineUrl} target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
                <MessageCircle className="w-3 h-3 text-[#06C755]" /> LINE: {lineId}
              </a>
              {settings.phone && (
                <a href={`tel:${settings.phone}`} className="hover:text-amber-400 flex items-center gap-1 transition-colors">
                  <Phone className="w-3 h-3 text-amber-400" /> {settings.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="bg-sand-50/95 backdrop-blur-md border-b border-sand-200/90 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Left: Brand Logo Lockup */}
            <a href="#" className="flex items-center gap-3 shrink-0 group">
              <img
                src={settings.brand_logo_image || "/logo.webp"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
                alt="RUBBER DOLL THAILAND Official Logo"
                width="44"
                height="44"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-2xs border border-sand-200 group-hover:border-bronze transition-colors shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-ink group-hover:text-bronze transition-colors whitespace-nowrap">
                    {settings.brand_name || 'RUBBER DOLL'}
                  </span>
                  <span className="text-[10px] font-sans font-bold tracking-widest px-1.5 py-0.5 rounded bg-sand-200 text-bronze-dark shrink-0">
                    {settings.brand_tag || 'TH'}
                  </span>
                </div>
                <span className="text-[10px] text-ink-muted tracking-widest uppercase font-medium whitespace-nowrap">
                  {settings.brand_est || t.nav.est}
                </span>
              </div>
            </a>

            {/* Center: Desktop Navigation Links */}
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

            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              
              {/* Language Switcher */}
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
                type="button"
                onClick={onToggleAdultMode}
                className={`relative px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full border text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-2xs shrink-0 ${
                  isAdultMode
                    ? 'bg-rose-600 border-rose-600 text-white shadow-rose-200 animate-pulse'
                    : 'bg-white border-sand-300 text-ink-soft hover:border-rose-300 hover:text-rose-600'
                }`}
                title="โหมดผู้ใหญ่ 18+ Uncensored"
              >
                <Flame className={`w-3.5 h-3.5 ${isAdultMode ? 'fill-white text-white' : 'text-rose-500'}`} />
                <span className="hidden sm:inline">18+</span>
              </button>

              {/* Search Icon */}
              <button
                type="button"
                onClick={onSearchClick}
                className="p-2 sm:p-2.5 rounded-full text-ink-muted hover:text-ink hover:bg-sand-200/60 transition-colors shadow-2xs bg-white border border-sand-300/80 shrink-0"
                aria-label="ค้นหาสินค้า / Search"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* LINE CTA Button */}
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-soft hover:shadow-soft-hover transition-all duration-200 shrink-0 active:scale-98"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t.nav.chatLine}</span>
              </a>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-sand-200/60 transition-colors shrink-0"
                aria-label="เปิดเมนู / Open Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-sand-50/98 backdrop-blur-xl border-b border-sand-200 px-4 pt-3 pb-6 shadow-modal space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {allDrawerLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium text-ink-soft hover:text-ink hover:bg-sand-100 transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-bronze text-xs">➔</span>
              </a>
            ))}
          </nav>

          <div className="pt-2 border-t border-sand-200">
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#06C755] text-white py-3.5 rounded-2xl text-xs font-bold shadow-soft"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{t.nav.chatLine} ({lineId})</span>
            </a>
          </div>
        </div>
      )}

    </header>
  );
}
