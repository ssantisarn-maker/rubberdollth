import React, { useState } from 'react';
import { Sparkles, MessageCircle, Zap, Play, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { translations } from '../../data/translations';

export default function SpotlightShowcase({ lang = 'th' }) {
  const { settings } = useSiteSettings();
  const [videoActive, setVideoActive] = useState(false);
  const t = translations[lang] || translations.th;

  // If disabled in CMS, do not render
  if (!settings.spotlight_enabled) {
    return null;
  }

  const badge = settings.spotlight_badge || '⚡ สินค้าไฮไลท์พร้อมส่งด่วนในไทย (1-2 วันรับของทันที)';
  const title = settings.spotlight_title || 'MODEL SPOTLIGHT: SLC-108 น้องมิยู สไตล์ญี่ปุ่น อกคัพ C';
  const subtitle = settings.spotlight_subtitle || 'สัมผัสนุ่มละมุนเสมือนผิวจริง 100% Medical Silicone โครงสร้างข้อต่อปรับได้ 360 องศา พร้อมส่งทันทีไม่ต้องรอสั่งผลิต';
  const price = settings.spotlight_price || 'ติดต่อสอบถามทาง LINE';
  const originalPrice = settings.spotlight_original_price || '';
  const image = settings.spotlight_image || 'https://cdn.zyrosite.com/cdn-ecommerce/store_01KYYQFNVFQMCAMTY5SZA4J5H8/assets/7ee33a0f-4684-42bb-b140-e282b3df64a3.jpg';
  const videoUrl = settings.spotlight_video_url || '';
  const ctaText = settings.spotlight_cta_text || '💬 สั่งซื้อรุ่นนี้ทันทีทาง LINE';
  const lineUrl = settings.line_url || 'https://line.me/R/ti/p/@RUBBERDOLL.TH';

  const specs = [
    { label: 'ส่วนสูง (Height)', value: settings.spotlight_specs_height || '160 cm' },
    { label: 'น้ำหนัก (Weight)', value: settings.spotlight_specs_weight || '35 kg' },
    { label: 'สรีระหน้าอก (Bust)', value: settings.spotlight_specs_bust || 'คัพ C สมจริง' },
    { label: 'ผิวสัมผัส (Skin)', value: settings.spotlight_specs_skin || 'ผิวขาวอมชมพู นุ่มเสมือนคนจริง' },
  ];

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    if (cleanUrl.includes('youtu.be/')) {
      const id = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
      return 'https://www.youtube.com/embed/' + id + '?autoplay=1';
    }
    if (cleanUrl.includes('youtube.com/watch?v=')) {
      const id = cleanUrl.split('v=')[1]?.split('&')[0];
      return 'https://www.youtube.com/embed/' + id + '?autoplay=1';
    }
    if (cleanUrl.includes('youtube.com/shorts/')) {
      const id = cleanUrl.split('shorts/')[1]?.split('?')[0];
      return 'https://www.youtube.com/embed/' + id + '?autoplay=1';
    }
    if (cleanUrl.includes('youtube.com/embed/')) {
      return cleanUrl;
    }
    return null;
  };

  const embedUrl = getVideoEmbedUrl(videoUrl);

  return (
    <section id="spotlight" className="py-10 sm:py-16 bg-gradient-to-b from-sand-100/70 to-white border-b border-sand-200 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute -top-20 right-10 w-96 h-96 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-96 h-96 bg-rose-400/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Glassmorphic Showcase Box */}
        <div className="bg-gradient-to-br from-sand-900 via-ink to-black text-white rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-2xl border border-amber-500/30 overflow-hidden relative">
          
          {/* Decorative Corner Ribbon */}
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-8 rotate-45 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 text-[11px] sm:text-xs font-black py-2 px-14 shadow-lg uppercase tracking-wider hidden sm:block">
            READY TO SHIP
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Col: Media (Video Player or Large Image) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/60 group">
                
                {videoActive && embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title="Spotlight Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoActive && videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      onError={e => { e.target.src = '/favicon.png'; }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {videoUrl && (
                      <button
                        onClick={() => setVideoActive(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors group/btn cursor-pointer"
                        title="กดเพื่อเล่นวิดีโอตัวอย่าง"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 flex items-center justify-center shadow-2xl transform group-hover/btn:scale-110 transition-transform">
                          <Play className="w-8 h-8 fill-gray-950 translate-x-0.5" />
                        </div>
                        <span className="absolute bottom-4 bg-black/70 backdrop-blur-md text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-500/30">
                          ▶ ดูคลิปวิดีโอตัวจริงของรุ่นนี้
                        </span>
                      </button>
                    )}
                  </>
                )}

                {/* Status Tag on Media */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span className="bg-amber-500 text-gray-950 text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-gray-950" />
                    <span>พร้อมส่งในไทยทันที</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col: Editorial Details & CTA */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{badge}</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <h2 className="font-sans text-2xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed whitespace-pre-line">
                  {subtitle}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                {specs.map((s, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="text-[11px] text-gray-400 block">{s.label}</span>
                    <span className="text-xs sm:text-sm font-bold text-amber-300 block truncate">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Price & Guarantee */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div>
                  <span className="text-[11px] text-gray-400 block">ราคาพิเศษพร้อมจัดส่ง:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-2xl font-black text-amber-400 font-sans">
                      {price}
                    </span>
                    {originalPrice && (
                      <span className="text-xs text-gray-400 line-through font-sans">
                        {originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-emerald-400 font-bold block flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" /> การันตีส่งด่วนลับ 100%
                  </span>
                  <span className="text-[10px] text-gray-400">กล่องทึบ 2 ชั้น ไร้ชื่อสินค้า</span>
                </div>
              </div>

              {/* CTA Line Button */}
              <div className="pt-2">
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-[#06C755]/20 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>{ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
