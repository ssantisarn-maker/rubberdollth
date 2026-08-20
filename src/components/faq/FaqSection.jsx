import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { translations } from '../../data/translations';

export default function FaqSection({ lang = 'th' }) {
  const [openIdx, setOpenIdx] = useState(0);
  const t = translations[lang] || translations.th;

  const faqs_th = [
    {
      q: '1. การจัดส่งมิดชิดแค่ไหน จะมีใครรู้ไหมว่าข้างในคืออะไร?',
      a: 'ปลอดภัย 100% ครับ สินค้าถูกบรรจุในกล่องทึบหนาพิเศษ 3 ชั้น ไม่มีรูปภาพ โลโก้ หรือข้อความใดๆ ที่บ่งบอกถึงตุ๊กตายาง จ่าหน้าผู้ส่งเป็นชื่อบุคคลหรืออุปกรณ์เครื่องใช้ทั่วไปอย่างมิดชิดที่สุด'
    },
    {
      q: '2. ซิลิโคนเกรดการแพทย์แท้ แตกต่างจาก TPE ทั่วไปอย่างไร?',
      a: 'ซิลิโคนเกรดการแพทย์มีความทนทานสูงกว่ามาก ไม่มีกลิ่นน้ำมัน ไม่ละลายหรือเหนียวเหนอะหนะ ให้สัมผัสนุ่มและมีอุณหภูมิผิวใกล้เคียงมนุษย์แท้ อายุการใช้งานยาวนาน 5-10 ปี'
    },
    {
      q: '3. โครงกระดูก EVO สแตนเลส ขยับจัดท่าทางได้จริงไหม?',
      a: 'ขยับได้ทุกข้อต่อ 360 องศาครับ รองรับทั้งท่ายืน นั่ง คุกเข่า หรือนอน สามารถจัดท่าทางตามความต้องการได้อย่างเป็นธรรมชาติและแข็งแรงมั่นคง'
    },
    {
      q: '4. มีสินค้าพร้อมส่งในไทยเลยไหม หรือต้องพรีออเดอร์?',
      a: 'เรามีทั้ง "สินค้าพร้อมส่งในไทย" จัดส่งด่วน 1-2 วันถึงบ้าน หรือนัดรับได้ในเขต กทม. และปริมณฑล รวมถึงรุ่นพรีออเดอร์ที่นำเข้าตามสั่งระยะเวลาประมาณ 7-14 วันครับ'
    },
    {
      q: '5. ได้รับอุปกรณ์และของแถมอะไรบ้างในกล่อง?',
      a: 'ได้รับครบชุดพร้อมใช้งานทันที ได้แก่: ชุดแต่งกายตามสไตล์, วิกผมพรีเมียม, แป้งฝุ่นซิลิโคนบำรุงผิว, อุปกรณ์ทำความสะอาด, และชุดบำรุงรักษาครบวงจร'
    }
  ];

  const faqs_en = [
    {
      q: '1. How discreet is the shipping? Will anyone know what is inside?',
      a: '100% confidential and discreet. All parcels are shipped in heavy-duty 3-layer unmarked plain boxes with zero brand logos or sensitive keywords on the exterior label.'
    },
    {
      q: '2. What is the difference between Medical Silicone and standard TPE?',
      a: 'Medical-grade silicone is vastly superior: completely odorless, non-greasy, non-melting, and replicates realistic human skin texture and temperature with 5-10 years lifespan.'
    },
    {
      q: '3. Can the EVO stainless steel skeleton be posed in any position?',
      a: 'Yes, full 360-degree articulation allows standing, sitting, kneeling, and laying poses securely with lifelike flexibility.'
    },
    {
      q: '4. Are there ready-to-ship models in Thailand?',
      a: 'Yes, we have 23+ ready stock models in Thailand available for express 1-2 day delivery or Bangkok pickup, as well as customized pre-orders (7-14 days).'
    },
    {
      q: '5. What free accessories are included in the box?',
      a: 'Every doll includes a full luxury package: styled outfit set, premium interchangeable wig, silicone powder, and complete cleaning/care kit.'
    }
  ];

  const faqs = lang === 'en' ? faqs_en : faqs_th;

  return (
    <section id="faq" className="py-16 sm:py-24 bg-sand-50 border-b border-sand-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-bronze">{t.faq.tag}</span>
          <h2 className="font-sans text-2xl sm:text-4xl font-bold text-ink">{t.faq.title}</h2>
          <p className="text-sm text-ink-muted font-light">{t.faq.desc}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-sand-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-sans font-bold text-sm sm:text-base text-ink hover:text-bronze transition-colors tracking-normal"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-bronze transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-ink-muted font-light leading-relaxed border-t border-sand-100 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
