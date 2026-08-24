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
  product_sort_mode: 'ready_first',
  product_sort_prefix: 'HALF',
  
  // Hero Section
  hero_tag: 'MASTERPIECES OF REALISM • HYPER-REALISTIC SILICONE',
  hero_title: 'สุนทรียภาพแห่งสัมผัสเสมือนจริง ระดับ Hi-End อันดับ 1 ในไทย',
  hero_subtitle: 'ตุ๊กตายางซิลิโคนแท้ 100% เกรดการแพทย์ โครงสร้างสแตนเลส 360° ปรับได้ทุกท่วงท่า จัดส่งมิดชิดลับเฉพาะ 100% รับประกันคุณภาพสูงสุด',
  hero_bg_image: '',
  hero_btn_primary_text: 'ดูแคตตาล็อกสินค้าทั้งหมด',
  hero_btn_secondary_text: 'ปรึกษาแอดมินทาง LINE',
  
  // Trust Badges
  trust_discrete_title: 'ส่งลับเฉพาะ 100% (Discreet Shipping)',
  trust_discrete_desc: 'แพ็กเกจกล่องทึบ 2 ชั้น ไม่ระบุชื่อร้านหรือชื่อสินค้าหน้ากล่อง รักษาความเป็นส่วนตัวสูงสุด',
  trust_quality_title: 'Pure Medical Silicone 100%',
  trust_quality_desc: 'สัมผัสนุ่มละมุนเสมือนผิวมนุษย์จริง ปลอดภัย ไร้กลิ่น ทนทาน และทำความสะอาดง่าย',
  trust_support_title: 'ทีมงานไทยดูแลตลอด 24 ชม.',
  trust_support_desc: 'พร้อมให้คำแนะนำการเลือกโมเดล สรีระ น้ำหนัก และการดูแลรักษาอย่างมืออาชีพ',

  // The Masterpiece Difference (Value Pillars)
  values_tag: 'THE MASTERPIECE DIFFERENCE',
  values_heading: 'เอกลักษณ์แห่งความสมบูรณ์แบบ ที่สัมผัสได้จริง',
  values_p1_title: 'Medical-Grade Silicone 100%',
  values_p1_desc: 'ซิลิโคนแท้เกรดการแพทย์ ให้สัมผัสอ่อนนุ่ม อุ่นละมุน ยืดหยุ่นเสมือนผิวจริง ปลอดภัย ไร้กลิ่น',
  values_p2_title: '100% Discreet Packaging',
  values_p2_desc: 'แพ็กเกจกล่องทึบ 2 ชั้น ไม่ระบุชื่อร้านหรือชื่อสินค้าหน้ากล่อง รักษาความเป็นส่วนตัวสูงสุด',
  values_p3_title: 'Full 360° Articulation',
  values_p3_desc: 'โครงสร้างสแตนเลสข้อต่อปรับได้ 360 องศา รองรับทุกท่วงท่าอย่างเป็นธรรมชาติและแข็งแรง',
  values_p4_title: 'Direct Care & Support',
  values_p4_desc: 'บริการให้คำแนะนำและดูแลตลอดอายุการใช้งาน โดยทีมงานคนไทยผู้เชี่ยวชาญ 24 ชม.',

  // Discreet Delivery (100% Confidential)
  discreet_tag: '100% CONFIDENTIAL & DISCREET DELIVERY',
  discreet_title: 'มาตรฐานการจัดส่ง มิดชิดและเป็นความลับขั้นสูงสุด',
  discreet_desc: 'เราเข้าใจและให้ความสำคัญกับความเป็นส่วนตัวของคุณสูงสุด ทุกคำสั่งซื้อจัดส่งในกล่องพัสดุทึบ 2 ชั้น ไม่ระบุชื่อร้านหรือชื่อสินค้าหน้ากล่องเด็ดขาด',
  discreet_l1_title: 'ปิดผนึกชั้นในมิดชิด (Protective Wrap)',
  discreet_l1_desc: 'ตัวสินค้าได้รับการห่อหุ้มด้วยวัสดุป้องกันการกระแทกและซีลสุญญากาศ ป้องกันฝุ่นและความชื้น 100%',
  discreet_l2_title: 'กล่องพัสดุทึบไร้โลโก้ (Double-Walled Box)',
  discreet_l2_desc: 'บรรจุในกล่องลูกฟูกหนา 2 ชั้น เรียบหรู ไม่มีข้อความ รูปภาพ หรือโลโก้ใดๆ ที่บ่งบอกถึงสินค้าภายใน',
  discreet_l3_title: 'จัดส่งด่วนลับเฉพาะ (Direct Discreet Courier)',
  discreet_l3_desc: 'ส่งตรงถึงมือคุณด้วยขนส่งด่วนพิเศษ มีเลขพัสดุส่วนตัวเช็กสถานะได้ตลอด 24 ชั่วโมง',

  // Longevity Care
  care_tag: 'THE LONGEVITY CARE',
  care_title: 'คู่มือการดูแลรักษา เพื่อยืดอายุการใช้งานยาวนาน',
  care_desc: 'ขั้นตอนง่ายๆ ในการดูแลและทำความสะอาดซิลิโคน เพื่อคงสัมผัสนุ่มละมุนเสมือนผิวจริงอยู่เสมอ',
  care_s1_title: '1. การทำความสะอาด (Washing)',
  care_s1_desc: 'ล้างด้วยน้ำอุณหภูมิปกติและสบู่อ่อนหรือน้ำยาฆ่าเชื้อเกรดอ่อน หลีกเลี่ยงน้ำร้อนจัด',
  care_s2_title: '2. การซับให้แห้ง (Drying)',
  care_s2_desc: 'ใช้ผ้าขนหนูนุ่มซับเบาๆ ให้แห้งสนิท หรือใช้พัดลมเป่า ห้ามใช้ไดร์เป่าผมลมร้อนเด็ดขาด',
  care_s3_title: '3. การลงแป้งบำรุง (Silicone Powder)',
  care_s3_desc: 'ทาแป้งเด็กหรือแป้งบำรุงผิวซิลิโคนบางๆ ทั่วผิวกาย เพื่อลดความเหนียวและคงสัมผัสนุ่มลื่นดุจแพรไหม',
  care_s4_title: '4. การจัดเก็บที่ถูกวิธี (Storage)',
  care_s4_desc: 'จัดเก็บในห้องอุณหภูมิปกติ เลี่ยงแสงแดดจัด แนะนำให้นอนราบบนเบาะนุ่มหรือแขวนด้วยอุปกรณ์เฉพาะ'
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const local = localStorage.getItem('rbd_site_settings');
      if (local) {
        return { ...defaultSettings, ...JSON.parse(local) };
      }
    } catch (e) {}
    return defaultSettings;
  });

  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings.php');
      if (!res.ok) throw new Error('Settings API offline');
      const data = await res.json();
      if (data.success && data.settings) {
        const merged = { ...defaultSettings, ...data.settings };
        setSettings(merged);
        try {
          localStorage.setItem('rbd_site_settings', JSON.stringify(merged));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Using local site settings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleStorageChange = () => {
      try {
        const local = localStorage.getItem('rbd_site_settings');
        if (local) setSettings(JSON.parse(local));
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('rbd_settings_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rbd_settings_updated', handleStorageChange);
    };
  }, []);

  const updateSettings = async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try {
      localStorage.setItem('rbd_site_settings', JSON.stringify(merged));
      window.dispatchEvent(new Event('rbd_settings_updated'));
    } catch (e) {}

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch('/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(merged)
      });
    } catch (e) {}
  };

  return { settings, setSettings: updateSettings, reload: fetchSettings, loading };
}
