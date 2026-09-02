import React from 'react';
import { Sparkles, MessageCircle, Mail, Globe, Phone } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function Footer({ lang = 'th', onSetLang }) {
  const { settings } = useSiteSettings();
  const t = translations[lang] || translations.th;

  const lineUrl = settings.line_url || siteConfig.lineUrl;
  const lineId = settings.line_id || siteConfig.lineId;

  return (
    <footer className="bg-sand-900 text-sand-200 pt-16 pb-12 border-t border-sand-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.brand_logo_image || "/logo.webp"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
                alt="RUBBER DOLL THAILAND Logo"
                width="40"
                height="40"
                className="w-10 h-10 rounded-xl object-cover shadow-2xs border border-sand-700 shrink-0"
              />
              <span className="font-serif text-xl font-bold tracking-wider text-white">
                {settings.brand_name || 'RUBBER DOLL'} <span className="text-bronze">{settings.brand_tag || 'TH'}</span>
              </span>

            </div>
            <p className="text-xs text-sand-400 leading-relaxed font-light max-w-sm">
              {settings.site_subtitle || t.footer.desc}
            </p>
            
            {/* Language Switcher */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-sand-400">Language:</span>
              <div className="inline-flex items-center bg-sand-800 p-0.5 rounded-full border border-sand-700">
                <button
                  onClick={() => onSetLang('th')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    lang === 'th' ? 'bg-sand-700 text-white' : 'text-sand-400 hover:text-white'
                  }`}
                >
                  ภาษาไทย (TH)
                </button>
                <button
                  onClick={() => onSetLang('en')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    lang === 'en' ? 'bg-sand-700 text-white' : 'text-sand-400 hover:text-white'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-xs text-sand-400 font-light">
              <li><a href="#catalog" className="hover:text-bronze transition-colors">{t.nav.catalog}</a></li>
              <li><a href="#catalog" className="hover:text-bronze transition-colors">{t.nav.ready}</a></li>
              <li><a href="#discreet" className="hover:text-bronze transition-colors">{t.nav.discreet}</a></li>
              <li><a href="#care" className="hover:text-bronze transition-colors">{t.nav.care}</a></li>
              <li><a href="#reviews" className="hover:text-bronze transition-colors">{t.nav.reviews}</a></li>
              <li><a href="#faq" className="hover:text-bronze transition-colors">{t.nav.faq}</a></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wider">{t.nav.contact}</h4>
            <p className="text-xs text-sand-400 font-light leading-relaxed">
              LINE Official: <strong className="text-white font-mono">{lineId}</strong><br />
              {settings.email && (
                <>อีเมล: <strong className="text-white font-mono">{settings.email}</strong><br /></>
              )}
              {settings.phone && (
                <>โทรศัพท์: <strong className="text-white font-mono">{settings.phone}</strong><br /></>
              )}
              เวลาทำการ: <span className="text-sand-300">{settings.business_hours || 'ทุกวัน 24 ชม.'}</span>
            </p>
            <div className="pt-2">
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#06C755] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow hover:bg-[#05b34c] transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t.nav.chatLine}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-8 border-t border-sand-800 text-center text-xs text-sand-400 font-light">
          {settings.footer_copyright_text || `© 2019 - 2026 RUBBER DOLL THAILAND. ${t.footer.rights}`}
        </div>

      </div>
    </footer>
  );
}
