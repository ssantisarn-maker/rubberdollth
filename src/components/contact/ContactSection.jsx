import React from 'react';
import { MessageCircle, Mail, Clock, Phone, ShieldCheck, Heart } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function ContactSection({ lang = 'th' }) {
  const { settings } = useSiteSettings();
  const t = translations[lang] || translations.th;

  const lineId = settings.line_id || siteConfig.lineId || '@RUBBERDOLL.TH';
  const lineUrl = settings.line_url || siteConfig.lineUrl || 'https://line.me/R/ti/p/@RUBBERDOLL.TH';
  const email = settings.email || siteConfig.contactEmail || 'contact@rubberdollth.com';
  const phone = settings.phone || siteConfig.contactPhone || '086-004-3541';
  const businessHours = settings.business_hours || 'เปิดบริการทุกวัน 24 ชม. (จัดส่งด่วนทุกวัน)';

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-bronze">
            {t.contact.tag}
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl font-extrabold text-ink">
            {t.contact.title}
          </h2>
          <p className="text-sm sm:text-base text-ink-muted font-normal leading-relaxed">
            {t.contact.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LINE Card */}
          <div className="p-8 rounded-3xl bg-[#06C755]/5 border border-[#06C755]/25 text-center space-y-4 shadow-2xs hover:shadow-soft transition-all">
            <div className="w-16 h-16 rounded-2xl bg-[#06C755] text-white flex items-center justify-center mx-auto shadow-md">
              <MessageCircle className="w-8 h-8 fill-white" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-ink">LINE Official</h3>
              <p className="text-sm text-emerald-800 mt-1 font-mono font-bold">{lineId}</p>
            </div>
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
            >
              {lineId ? `${t.contact.lineCta} (${lineId})` : t.contact.lineCta}
            </a>
          </div>

          {/* Email Card */}
          <div className="p-8 rounded-3xl bg-sand-50/80 border border-sand-200 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-white border border-sand-200 text-bronze flex items-center justify-center mx-auto shadow-2xs">
              <Mail className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-ink">{t.contact.emailTitle}</h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1 font-mono font-medium">{email}</p>
            </div>
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center justify-center w-full py-3.5 rounded-xl bg-white border border-sand-300 text-ink text-xs sm:text-sm font-bold hover:bg-sand-100 transition-colors shadow-2xs"
            >
              {email}
            </a>
          </div>

          {/* Phone & 24/7 Service Card */}
          <div className="p-8 rounded-3xl bg-sand-50/80 border border-sand-200 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-white border border-sand-200 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <Phone className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-ink">โทรศัพท์ติดต่อด่วน</h3>
              <p className="text-sm text-ink font-bold mt-1 font-mono">{phone}</p>
              <p className="text-[11px] text-ink-muted mt-0.5">{businessHours}</p>
            </div>
            <a
              href={`tel:${phone.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center justify-center w-full py-3.5 rounded-xl bg-ink hover:bg-sand-900 text-white text-xs sm:text-sm font-bold transition-colors shadow-2xs"
            >
              โทร {phone}
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
