import React from 'react';
import { Droplets, Wind, Feather, Box } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function CareGuide({ lang = 'th' }) {
  const { settings } = useSiteSettings();

  const steps = [
    { title: settings.care_s1_title || '1. การทำความสะอาด (Washing)', desc: settings.care_s1_desc || 'ล้างด้วยน้ำอุณหภูมิปกติและสบู่อ่อนหรือน้ำยาฆ่าเชื้อเกรดอ่อน หลีกเลี่ยงน้ำร้อนจัด', icon: Droplets },
    { title: settings.care_s2_title || '2. การซับให้แห้ง (Drying)', desc: settings.care_s2_desc || 'ใช้ผ้าขนหนูนุ่มซับเบาๆ ให้แห้งสนิท หรือใช้พัดลมเป่า ห้ามใช้ไดร์เป่าผมลมร้อนเด็ดขาด', icon: Wind },
    { title: settings.care_s3_title || '3. การลงแป้งบำรุง (Silicone Powder)', desc: settings.care_s3_desc || 'ทาแป้งเด็กหรือแป้งบำรุงผิวซิลิโคนบางๆ ทั่วผิวกาย เพื่อลดความเหนียวและคงสัมผัสนุ่มลื่นดุจแพรไหม', icon: Feather },
    { title: settings.care_s4_title || '4. การจัดเก็บที่ถูกวิธี (Storage)', desc: settings.care_s4_desc || 'จัดเก็บในห้องอุณหภูมิปกติ เลี่ยงแสงแดดจัด แนะนำให้นอนราบบนเบาะนุ่มหรือแขวนด้วยอุปกรณ์เฉพาะ', icon: Box },
  ];

  return (
    <section id="care" className="py-16 sm:py-24 bg-sand-50 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-bronze">
            {settings.care_tag || 'THE LONGEVITY CARE'}
          </span>
          <h2 className="font-sans text-2xl sm:text-4xl font-extrabold text-ink">
            {settings.care_title || 'คู่มือการดูแลรักษา เพื่อยืดอายุการใช้งานยาวนาน'}
          </h2>
          <p className="text-sm sm:text-base text-ink-muted font-normal leading-relaxed">
            {settings.care_desc || 'ขั้นตอนง่ายๆ ในการดูแลและทำความสะอาดซิลิโคน เพื่อคงสัมผัสนุ่มละมุนเสมือนผิวจริงอยู่เสมอ'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-sand-300 shadow-soft hover:shadow-soft-hover transition-all duration-300 space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-sand-50 border border-sand-300 flex items-center justify-center text-bronze shadow-2xs">
                  <Icon className="w-7 h-7 text-amber-700" />
                </div>
                <h3 className="font-sans text-base sm:text-lg font-bold text-ink">{s.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed font-normal">{s.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
