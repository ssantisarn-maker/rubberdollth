import { useState, useEffect } from 'react';

const defaultSettings = {
  site_title: 'RUBBER DOLL THAILAND - ซิลิโคนแท้ระดับ Hi-End อันดับ 1 ในไทย',
  site_subtitle: 'ตุ๊กตายางพรีเมียม สัมผัสเสมือนจริง โครงสร้างข้อต่อสแตนเลส 360 องศา',
  line_id: '@RUBBERDOLL.TH',
  line_url: 'https://line.me/R/ti/p/@RUBBERDOLL.TH',
  phone: '086-004-3541',
  email: 'contact@rubberdollth.com',
  business_hours: 'เปิดบริการทุกวัน 24 ชม. (จัดส่งด่วนทุกวัน)',
  announcement_enabled: true,
  announcement_badge: '🔥 โปรโมชั่นพิเศษ',
  announcement_text: 'สต็อกพร้อมส่งในไทย! สั่งซื้อวันนี้รับฟรี The Luxury Collector Box + ส่งด่วนลับเฉพาะทั่วประเทศ',
  shipping_badge_text: '📦 บริการจัดส่งลับเฉพาะ 100%',
  shipping_announcement_text: 'การันตีจัดส่งมิดชิด 100% กล่องทึบ 2 ชั้น ไร้ชื่อร้าน/ชื่อสินค้าหน้ากล่องเด็ดขาด',

  // Typography & Sizing
  font_size_scale: 'large', // 'normal' | 'large' | 'xlarge'
  font_family_preset: 'modern_prompt',

  // Brand Identity
  brand_logo_image: '',
  brand_name: 'RUBBER DOLL',
  brand_tag: 'TH',
  brand_est: 'EST. 2019 • LUXURY COLLECTION',

  product_sort_mode: 'ready_then_code_asc',
  product_sort_prefix: 'HALF',
  
  // Hero Section
  hero_tag: 'MASTERPIECES OF REALISM • HYPER-REALISTIC SILICONE',
  hero_pretitle: 'นิยามใหม่แห่งความสมจริงเหนือระดับ',
  hero_title: 'สุนทรียภาพแห่งสัมผัสเสมือนจริง ระดับ Hi-End อันดับ 1 ในไทย',
  hero_subtitle: 'ตุ๊กตายางซิลิโคนแท้ 100% เกรดการแพทย์ โครงสร้างสแตนเลส 360° ปรับได้ทุกท่วงท่า จัดส่งมิดชิดลับเฉพาะ 100% รับประกันคุณภาพสูงสุด',
  hero_bg_image: '',
  hero_btn_primary_text: 'ดูแคตตาล็อกสินค้าทั้งหมด',
  hero_btn_secondary_text: 'ปรึกษาแอดมินทาง LINE',

  // Spotlight Ready-to-Ship Showcase
  spotlight_enabled: false,
  spotlight_badge: '⚡ สินค้าไฮไลท์พร้อมส่งด่วนในไทย (1-2 วันรับของทันที)',
  spotlight_title: 'MODEL SPOTLIGHT: SLC-108 น้องมิยู สไตล์ญี่ปุ่น อกคัพ C',
  spotlight_subtitle: 'สัมผัสนุ่มละมุนเสมือนผิวจริง 100% Medical Silicone โครงสร้างข้อต่อปรับได้ 360 องศา พร้อมส่งทันทีไม่ต้องรอสั่งผลิต',
  spotlight_price: 'ติดต่อสอบถามทาง LINE',
  spotlight_original_price: '',
  spotlight_image: '',
  spotlight_video_url: '',
  spotlight_cta_text: '💬 สั่งซื้อรุ่นนี้ทันทีทาง LINE',
  spotlight_specs_height: '160 cm',
  spotlight_specs_weight: '35 kg',
  spotlight_specs_bust: 'คัพ C สรีระสมจริง',
  spotlight_specs_skin: 'ผิวขาวอมชมพู สัมผัสนุ่มเสมือนคนจริง',

  // Product Catalog Section Headers & Filters
  catalog_tag: 'EXCLUSIVE SILICONE COLLECTION',
  catalog_title: 'คลังสินค้าตุ๊กตายางซิลิโคนแท้ระดับ Hi-End',
  catalog_subtitle: 'ตุ๊กตายางซิลิโคนแท้ระดับ Hi-End 100% สัมผัสเสมือนจริง เลื่อนเมาส์ชี้บนรูปภาพเพื่อดูมุมมองสรีระจริง',
  catalog_filter_title: 'เลือกชมตามหมวดหมู่',
  catalog_search_placeholder: 'ค้นหารหัสโมเดล เช่น HALF-01, SLC-108, หรือสเปก...',
  catalog_found_text: 'ค้นพบทั้งหมด',
  catalog_items_unit: 'รายการ',
  catalog_load_more_btn: 'ดูสินค้าเพิ่มเติม',
  catalog_all_loaded_text: 'แสดงสินค้าครบทั้งหมดแล้ว',

  // Product Card Badges & Buttons
  card_ready_badge: 'พร้อมส่ง (ไทย)',
  card_adult_badge: '18+ Uncensored',
  card_angles_unit: 'มุมมอง',
  card_specs_btn_text: 'สเปก & กล่องของขวัญ',
  card_order_btn_text: 'สั่งซื้อ',
  card_quickview_btn_text: 'ดูสเปก & แกลเลอรีเต็ม',
  card_ask_price_text: 'ติดต่อสอบถามทาง LINE',

  // Product Modal Headings & Buttons
  modal_adult_badge: '18+ Uncensored Mode',
  modal_zoom_btn_text: '🔍 กดเพื่อซูมภาพ HD',
  modal_specs_title: '📐 ข้อมูลสเปกความพรีเมียม (SPECIFICATIONS)',
  modal_gifts_title: '🎁 THE LUXURY COLLECTOR BOX (เซ็ตของขวัญระดับพรีเมียม)',
  modal_gifts_default: 'ชุดแฟชั่นสั่งตัดตามสไตล์โมเดล, วิกผมเกรดพรีเมียม สัมผัสนุ่มลื่น, แป้งฝุ่นบำรุงผิว Silky Smooth Powder, เซ็ตอุปกรณ์ทำความสะอาดและดูแลรักษาครบวงจร',
  modal_cta_btn_text: '💬 สั่งซื้อ / สอบถามข้อมูล LINE',
  modal_trust_1: 'กล่องทึบ 2 ชั้น ไม่ระบุชื่อสินค้า',
  modal_trust_2: 'ส่งด่วน 1-2 วันรับของทั่วประเทศ',
  modal_trust_3: 'ดูแลส่วนตัว 24 ชม.',

  // Navbar & Menu Navigation Links
  nav_search_placeholder: 'ค้นหารหัสโมเดล เช่น HALF-01, SLC-108...',
  nav_adult_mode_btn: 'โหมด 18+ (ไม่มีเซนเซอร์)',
  nav_adult_mode_active_btn: 'โหมดปกติ (มีเซนเซอร์)',
  nav_menu_catalog: 'แคตตาล็อกสินค้า',
  nav_menu_ready: 'พร้อมส่งทันที (ไทย)',
  nav_menu_discreet: 'จัดส่งลับเฉพาะ',
  nav_menu_care: 'ดูแลรักษา',
  nav_menu_reviews: 'รีวิวลูกค้า',
  nav_menu_faq: 'คำถามพบบ่อย',
  nav_menu_contact: 'ติดต่อเรา',
  nav_cta_btn: '💬 สั่งซื้อทาง LINE',

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
  values_p1_image: '',
  values_p2_title: '100% Discreet Packaging',
  values_p2_desc: 'แพ็กเกจกล่องทึบ 2 ชั้น ไม่ระบุชื่อร้านหรือชื่อสินค้าหน้ากล่อง รักษาความเป็นส่วนตัวสูงสุด',
  values_p2_image: '',
  values_p3_title: 'Full 360° Articulation',
  values_p3_desc: 'โครงสร้างสแตนเลสข้อต่อปรับได้ 360 องศา รองรับทุกท่วงท่าอย่างเป็นธรรมชาติและแข็งแรง',
  values_p3_image: '',
  values_p4_title: 'Direct Care & Support',
  values_p4_desc: 'บริการให้คำแนะนำและดูแลตลอดอายุการใช้งาน โดยทีมงานคนไทยผู้เชี่ยวชาญ 24 ชม.',
  values_p4_image: '',

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

  // Customer Reviews Section
  reviews_tag: 'VERIFIED CUSTOMER STORIES',
  reviews_title: 'เสียงตอบรับและความประทับใจจากลูกค้าตัวจริง',
  reviews_rating_text: '5.0 / 5.0 (รีวิวลูกค้าจริง 100%)',

  // Social Share & LINE Link Preview (Open Graph)
  seo_og_title: 'RUBBER DOLL THAILAND | ผู้นำเข้าตุ๊กตายางซิลิโคนแท้เกรดพรีเมียมอันดับ 1',
  seo_og_desc: 'ตุ๊กตายางซิลิโคนเกรดการแพทย์ 100% สัมผัสนุ่มเสมือนผิวคนจริง โครงสร้างสแตนเลส 360° การันตีจัดส่งมิดชิด 100% ไร้ชื่อสินค้าหน้ากล่อง',
  seo_og_image: '',

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
  care_s4_desc: 'จัดเก็บในห้องอุณหภูมิปกติ เลี่ยงแสงแดดจัด แนะนำให้นอนราบบนเบาะนุ่มหรือแขวนด้วยอุปกรณ์เฉพาะ',

  // Contact Section
  contact_tag: 'PRIVATE & DISCREET INQUIRY',
  contact_title: 'ปรึกษาผู้เชี่ยวชาญแบบส่วนตัว (Private LINE)',
  contact_subtitle: 'ทีมงานคนไทยพร้อมดูแลและให้คำแนะนำตลอด 24 ชั่วโมง ข้อมูลทุกอย่างเป็นความลับ 100%',
  contact_line_btn: '💬 แชตปรึกษา / สั่งซื้อทาง LINE',
  contact_call_btn: '📞 โทรติดต่อด่วน',

  // Footer & General
  footer_tagline: 'สัมผัสนิยามใหม่แห่งความสมจริงเหนือระดับ ตุ๊กตายางซิลิโคนแท้เกรดการแพทย์ 100% อันดับ 1 ในไทย',
  footer_copyright_text: '© 2019-2026 RUBBER DOLL THAILAND. All rights reserved. ผู้นำเข้าตุ๊กตายางซิลิโคนแท้เกรดพรีเมียมอันดับ 1 ในไทย',
  footer_disclaimer: 'เว็บไซต์นี้สำหรับผู้ที่มีอายุ 18 ปีขึ้นไปเท่านั้น การสั่งซื้อทุกรายการจัดส่งมิดชิดเป็นความลับสูงสุด'
};

let globalSettingsPromise = null;
let lastFetchTime = 0;

const fetchGlobalSettings = async (force = false) => {
  const now = Date.now();
  if (!force && globalSettingsPromise) return globalSettingsPromise;
  if (!force && now - lastFetchTime < 5000) return null;

  globalSettingsPromise = (async () => {
    try {
      const res = await fetch(`/api/settings.php?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Settings API offline');
      const data = await res.json();
      if (data.success && data.settings) {
        lastFetchTime = Date.now();
        const merged = { ...defaultSettings, ...data.settings };
        localStorage.setItem('rbd_site_settings', JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('Using local settings cache:', err.message);
    } finally {
      globalSettingsPromise = null;
    }
    return null;
  })();

  return globalSettingsPromise;
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('rbd_site_settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return defaultSettings;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchGlobalSettings().then(fetched => {
      if (isMounted && fetched) {
        setSettings(fetched);
      }
    });

    const handleSettingsUpdate = (e) => {
      if (e.detail) {
        setSettings(prev => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('rbd_settings_updated', handleSettingsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('rbd_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const updateSettings = async (newSettings) => {
    setLoading(true);
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('rbd_site_settings', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('rbd_settings_updated', { detail: updated }));
    } catch (e) {}

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success && data.settings) {
        const merged = { ...defaultSettings, ...data.settings };
        setSettings(merged);
        localStorage.setItem('rbd_site_settings', JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('rbd_settings_updated', { detail: merged }));
        return { success: true };
      }
    } catch (err) {
      console.warn('Saved locally, API sync failed:', err.message);
    } finally {
      setLoading(false);
    }
    return { success: true };
  };

  return {
    settings,
    setSettings: updateSettings,
    reload: () => fetchGlobalSettings(true).then(res => { if (res) setSettings(res); }),
    loading
  };
}
