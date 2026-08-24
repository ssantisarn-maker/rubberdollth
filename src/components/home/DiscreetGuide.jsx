import React from 'react';
import { Shield, Package, Lock } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function DiscreetGuide({ lang = 'th' }) {
  const { settings } = useSiteSettings();

  const layers = [
    {
      step: '1',
      title: settings.discreet_l1_title || 'ปิดผนึกชั้นในมิดชิด (Protective Wrap)',
      description: settings.discreet_l1_desc || 'ตัวสินค้าได้รับการห่อหุ้มด้วยวัสดุป้องกันการกระแทกและซีลสุญญากาศ ป้องกันฝุ่นและความชื้น 100%',
      icon: Shield
    },
    {
      step: '2',
      title: settings.discreet_l2_title || 'กล่องพัสดุทึบไร้โลโก้ (Double-Walled Box)',
      description: settings.discreet_l2_desc || 'บรรจุในกล่องลูกฟูกหนา 2 ชั้น เรียบหรู ไม่มีข้อความ รูปภาพ หรือโลโก้ใดๆ ที่บ่งบอกถึงสินค้าภายใน',
      icon: Package
    },
    {
      step: '3',
      title: settings.discreet_l3_title || 'จัดส่งด่วนลับเฉพาะ (Direct Discreet Courier)',
      description: settings.discreet_l3_desc || 'ส่งตรงถึงมือคุณด้วยขนส่งด่วนพิเศษ มีเลขพัสดุส่วนตัวเช็กสถานะได้ตลอด 24 ชั่วโมง',
      icon: Lock
    }
  ];

  return (
    <section id="discreet" className="py-16 sm:py-24 bg-white border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-bronze">
            {settings.discreet_tag || '100% CONFIDENTIAL & DISCREET DELIVERY'}
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl font-bold text-ink">
            {settings.discreet_title || 'มาตรฐานการจัดส่ง มิดชิดและเป็นความลับขั้นสูงสุด'}
          </h2>
          <p className="text-sm text-ink-muted font-light leading-relaxed">
            {settings.discreet_desc || 'เราเข้าใจและให้ความสำคัญกับความเป็นส่วนตัวของคุณสูงสุด ทุกคำสั่งซื้อจัดส่งในกล่องพัสดุทึบ 2 ชั้น ไม่ระบุชื่อร้านหรือชื่อสินค้าหน้ากล่องเด็ดขาด'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {layers.map((l, idx) => {
            const Icon = l.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-sand-50/80 border border-sand-200 shadow-2xs hover:shadow-soft transition-all duration-300 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-sand-200 flex items-center justify-center text-bronze shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-sans text-3xl font-black tracking-tight text-sand-300">0{l.step}</span>
                </div>
                <h3 className="font-sans text-lg font-bold text-ink">{l.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed font-light">{l.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
