import React from 'react';
import { ShieldCheck, Package, RotateCcw, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function ValuePillars({ lang = 'th' }) {
  const { settings } = useSiteSettings();

  const pillars = [
    {
      icon: Sparkles,
      title: settings.values_p1_title || 'Medical-Grade Silicone 100%',
      description: settings.values_p1_desc || 'ซิลิโคนแท้เกรดการแพทย์ ให้สัมผัสอ่อนนุ่ม อุ่นละมุน ยืดหยุ่นเสมือนผิวจริง ปลอดภัย ไร้กลิ่น',
      image: settings.values_p1_image || '',
    },
    {
      icon: Package,
      title: settings.values_p2_title || '100% Discreet Packaging',
      description: settings.values_p2_desc || 'แพ็กเกจกล่องทึบ 2 ชั้น ไม่ระบุชื่อร้านหรือชื่อสินค้าหน้ากล่อง รักษาความเป็นส่วนตัวสูงสุด',
      image: settings.values_p2_image || '',
    },
    {
      icon: ShieldCheck,
      title: settings.values_p3_title || 'Full 360° Articulation',
      description: settings.values_p3_desc || 'โครงสร้างสแตนเลสข้อต่อปรับได้ 360 องศา รองรับทุกท่วงท่าอย่างเป็นธรรมชาติและแข็งแรง',
      image: settings.values_p3_image || '',
    },
    {
      icon: RotateCcw,
      title: settings.values_p4_title || 'Direct Care & Support',
      description: settings.values_p4_desc || 'บริการให้คำแนะนำและดูแลตลอดอายุการใช้งาน โดยทีมงานคนไทยผู้เชี่ยวชาญ 24 ชม.',
      image: settings.values_p4_image || '',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold tracking-widest text-bronze uppercase">
            {settings.values_tag || 'THE MASTERPIECE DIFFERENCE'}
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-ink">
            {settings.values_heading || 'เอกลักษณ์แห่งความสมบูรณ์แบบ ที่สัมผัสได้จริง'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-sand-50/70 border border-sand-200/80 hover:border-bronze hover:bg-sand-50 transition-all duration-300 shadow-2xs hover:shadow-soft flex flex-col justify-between group overflow-hidden"
              >
                <div className="space-y-3">
                  {item.image ? (
                    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-sand-200 bg-sand-100 shadow-2xs">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-white border border-sand-200 flex items-center justify-center text-bronze shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                  )}

                  <h3 className="font-serif text-base font-bold text-ink group-hover:text-bronze transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
