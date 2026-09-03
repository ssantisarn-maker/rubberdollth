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

  // Primary curated links (Fully dynamic from CMS)
  const desktopLinks = [
    { id: 'catalog', label: settings.nav_menu_catalog || (lang === 'th' ? `คอลเลกชัน ${productCount} รุ่น` : `${productCount} Models`), href: '#catalog' },
    { id: 'ready', label: settings.nav_menu_ready || (lang === 'th' ? 'พร้อมส่งทันที (ไทย)' : 'Ready Stock (TH)'), href: '#catalog' },
    { id: 'discreet', label: settings.nav_menu_discreet || (lang === 'th' ? 'จัดส่งลับเฉพาะ' : 'Discreet Box'), href: '#discreet' },
    { id: 'reviews', label: settings.nav_menu_reviews || (lang === 'th' ? 'รีวิวลูกค้า' : 'Reviews'), href: '#reviews' },
    { id: 'faq', label: settings.nav_menu_faq || (lang === 'th' ? 'คำถามพบบ่อย' : 'FAQ'), href: '#faq' },
  ];

  const allDrawerLinks = [
    { id: 'catalog', label: settings.nav_menu_catalog || (lang === 'th' ? `คอลเลกชัน ${productCount} รุ่น ทั้งหมด` : `All ${productCount} Models Collection`), href: '#catalog' },
    { id: 'ready', label: settings.nav_menu_ready || (lang === 'th' ? 'สินค้าพร้อมส่งทันทีในไทย (ด่วน 1-2 วัน)' : 'Ready to Ship in Thailand (Express)'), href: '#catalog' },
    { id: 'discreet', label: settings.nav_menu_discreet || (lang === 'th' ? 'นโยบายจัดส่งลับเฉพาะ 100% (Secret Box)' : '100% Secret & Discreet Shipping'), href: '#discreet' },
    { id: 'care', label: settings.nav_menu_care || (lang === 'th' ? 'ศิลปะการดูแลรักษา (The Longevity Care)' : 'Care & Maintenance Guide'), href: '#care' },
    { id: 'reviews', label: settings.nav_menu_reviews || (lang === 'th' ? 'รีวิวความประทับใจจากคอลเลกเตอร์' : 'Verified Collector Reviews'), href: '#reviews' },
    { id: 'faq', label: settings.nav_menu_faq || (lang === 'th' ? 'คำถามที่พบบ่อย (FAQ & Guide)' : 'Frequently Asked Questions (FAQ)'), href: '#faq' },
    { id: 'contact', label: settings.nav_menu_contact || (lang === 'th' ? 'ติดต่อ Private Advisor (LINE 24 ชม.)' : 'Contact Private Advisor (LINE 24/7)'), href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
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
              
              {/* Search Trigger */}
              <button
                onClick={onSearchClick}
                className="p-2.5 rounded-2xl text-ink-soft hover:text-bronze hover:bg-sand-100/80 transition-all"
                title={settings.nav_search_placeholder || t.nav.search}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* 18+ Uncensored Mode Button */}
              <button
                onClick={onToggleAdultMode}
                className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all duration-200 shadow-2xs ${
                  isAdultMode
                    ? 'bg-rose-600 border-rose-700 text-white shadow-rose-200 animate-pulse'
                    : 'bg-sand-100 border-sand-300 text-ink-soft hover:border-rose-400 hover:text-rose-600'
                }`}
                title="สลับโหมดภาพ Uncensored"
              >
                <Flame className={`w-3.5 h-3.5 ${isAdultMode ? 'fill-white' : 'text-rose-500'}`} />
                <span className="hidden sm:inline">
                  {isAdultMode ? (settings.nav_adult_mode_active_btn || '18+ Uncensored (เปิดอยู่)') : (settings.nav_adult_mode_btn || 'โหมด 18+ (ไม่มีเซนเซอร์)')}
                </span>
                <span className="sm:hidden font-bold">18+</span>
              </button>

              {/* LINE CTA Button */}
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-2 bg-[#06C755] hover:bg-[#05b34c] text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-soft hover:shadow-soft-hover transition-all duration-200 active:scale-98"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{settings.nav_cta_btn || t.nav.lineContact}</span>
              </a>

              {/* Mobile Menu Trigger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-2xl text-ink hover:bg-sand-100 transition-colors"
                aria-label="เปิดเมนูนำทาง"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Fullscreen Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bottom-0 bg-sand-50/98 backdrop-blur-xl border-t border-sand-200 z-50 overflow-y-auto px-6 py-6 flex flex-col justify-between animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-200">
              <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">เมนูนำทาง (NAVIGATION)</span>
              <span className="text-xs text-bronze font-mono font-bold">RUBBER DOLL TH</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {allDrawerLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-sand-200/80 text-sm font-bold text-ink hover:border-bronze hover:bg-sand-50 transition-all shadow-2xs"
                >
                  <span>{link.label}</span>
                  <span className="text-ink-muted text-xs">→</span>
                </a>
              ))}
            </div>
          </div>

          <div className="pt-6 space-y-3 border-t border-sand-200 mt-6">
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] text-white py-3.5 rounded-2xl text-sm font-bold shadow-md"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{settings.nav_cta_btn || `ติดต่อแอดมินทาง LINE (${lineId})`}</span>
            </a>

            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
                className="w-full flex items-center justify-center gap-2 bg-white border border-sand-300 text-ink py-3 rounded-2xl text-xs font-bold shadow-2xs hover:bg-sand-100"
              >
                <Phone className="w-4 h-4 text-bronze" />
                <span>โทรด่วน {settings.phone}</span>
              </a>
            )}

            <p className="text-[11px] text-center text-ink-muted">
              {settings.footer_copyright_text || '© 2026 RUBBER DOLL THAILAND. All rights reserved.'}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
