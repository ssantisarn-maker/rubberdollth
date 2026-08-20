import React from 'react';
import { MessageCircle, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';

export default function ContactSection({ lang = 'th' }) {
  const t = translations[lang] || translations.th;

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-bronze">
            {t.contact.tag}
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl font-bold text-ink">
            {t.contact.title}
          </h2>
          <p className="text-sm text-ink-muted font-light leading-relaxed">
            {t.contact.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LINE Card */}
          <div className="p-8 rounded-3xl bg-[#06C755]/5 border border-[#06C755]/20 text-center space-y-4 shadow-2xs hover:shadow-soft transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#06C755] text-white flex items-center justify-center mx-auto shadow-md">
              <MessageCircle className="w-7 h-7 fill-white" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-ink">LINE Official</h3>
              <p className="text-xs text-ink-muted mt-1 font-mono font-semibold">@{siteConfig.lineId}</p>
            </div>
            <a
              href={siteConfig.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold shadow transition-colors"
            >
              {t.contact.lineCta}
            </a>
          </div>

          {/* Email Card */}
          <div className="p-8 rounded-3xl bg-sand-50/80 border border-sand-200 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-white border border-sand-200 text-bronze flex items-center justify-center mx-auto shadow-2xs">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-ink">{t.contact.emailTitle}</h3>
              <p className="text-xs text-ink-muted mt-1 font-mono">{siteConfig.contactEmail}</p>
            </div>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-white border border-sand-300 text-ink text-xs font-bold hover:bg-sand-100 transition-colors"
            >
              {siteConfig.contactEmail}
            </a>
          </div>

          {/* 24/7 Service */}
          <div className="p-8 rounded-3xl bg-sand-50/80 border border-sand-200 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-white border border-sand-200 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-bold text-ink">{t.contact.phoneTitle}</h3>
              <p className="text-xs text-ink-muted mt-1 font-light">24 Hours / 7 Days Service</p>
            </div>
            <div className="text-xs text-ink-soft py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 font-medium">
              ✓ แอดมินตอบกลับภายใน 5 นาที
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
