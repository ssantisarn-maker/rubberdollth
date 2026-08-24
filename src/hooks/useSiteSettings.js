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
  product_sort_mode: 'ready_first', // 'ready_first', 'custom_order', 'updated_desc', 'code_asc', 'code_desc', 'prefix_priority', 'id_asc'
  product_sort_prefix: 'HALF',     // e.g. 'HALF', 'SLC', 'RBD', or custom letter
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
