import { useState, useEffect } from 'react';

const defaultSettings = {
  site_title: 'RUBBER DOLL THAILAND - ซิลิโคนแท้ระดับ Hi-End อันดับ 1 ในไทย',
  site_subtitle: 'ตุ๊กตายางพรีเมียม สัมผัสเสมือนจริง โครงสร้างข้อต่อสแตนเลส 360 องศา',
  line_id: '@RUBBERDOLL.TH',
  line_url: 'https://line.me/R/ti/p/@RUBBERDOLL.TH',
  phone: '086-004-3541',
  business_hours: 'เปิดบริการทุกวัน 24 ชม. (จัดส่งด่วนทุกวัน)',
  announcement_enabled: true,
  announcement_badge: '🔥 โปรโมชั่นพิเศษ',
  announcement_text: 'สต็อกพร้อมส่งในไทย! สั่งซื้อวันนี้รับฟรี The Luxury Collector Box + ส่งด่วนลับเฉพาะทั่วประเทศ',
  hero_tag: 'MASTERPIECES OF REALISM • HYPER-REALISTIC SILICONE',
  hero_title: 'สุนทรียภาพแห่งสัมผัสเสมือนจริง ระดับ Hi-End อันดับ 1 ในไทย',
  hero_subtitle: 'ตุ๊กตายางซิลิโคนแท้ 100% เกรดการแพทย์ โครงสร้างสแตนเลส 360° ปรับได้ทุกท่วงท่า จัดส่งมิดชิดลับเฉพาะ 100% รับประกันคุณภาพสูงสุด',
  hero_bg_image: '',
  hero_btn_primary_text: 'ดูแคตตาล็อกสินค้าทั้งหมด',
  hero_btn_secondary_text: 'ปรึกษาแอดมินทาง LINE',
  trust_discrete_title: 'ส่งลับเฉพาะ 100% (Discreet Shipping)',
  trust_discrete_desc: 'แพ็กเกจกล่องทึบ 2 ชั้น ไม่ระบุชื่อร้านหรือชื่อสินค้าหน้ากล่อง รักษาความเป็นส่วนตัวสูงสุด',
  trust_quality_title: 'Pure Medical Silicone 100%',
  trust_quality_desc: 'สัมผัสนุ่มละมุนเสมือนผิวมนุษย์จริง ปลอดภัย ไร้กลิ่น ทนทาน และทำความสะอาดง่าย',
  trust_support_title: 'ทีมงานไทยดูแลตลอด 24 ชม.',
  trust_support_desc: 'พร้อมให้คำแนะนำการเลือกโมเดล สรีระ น้ำหนัก และการดูแลรักษาอย่างมืออาชีพ'
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings.php');
      if (!res.ok) throw new Error('Settings API offline');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.warn('Using default site settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, setSettings, reload: fetchSettings, loading };
}
