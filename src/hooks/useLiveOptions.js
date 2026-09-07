import { useState, useEffect, useCallback } from 'react';

const defaultOptions = [
  { id: 'opt_1', name: '👩 ออฟชั่นผมปลูก+ปลูกคิ้ว สำหรับหัวซิลิโคน 👩', price: 5500, condition: '💗 สำหรับหัวซิลิโคนเท่านั้น 💗', details: '', image: '', video_url: '', target_material: 'silicone', is_active: 1, order_index: 1 },
  { id: 'opt_2', name: '💈 ออฟชั่นปลูกขนจิมิ 💈', price: 800, condition: '', details: '', image: '', video_url: '', target_material: 'all', is_active: 1, order_index: 2 },
  { id: 'opt_3', name: '💗จิมิแบบถอดออกได้💗', price: 2800, condition: '💗สำหรับ TPE เท่านั้น💗', details: '🌟 ข้อดี ง่ายต่อการทำความสะอาด 🌟', image: '', video_url: '', target_material: 'tpe', is_active: 1, order_index: 3 },
  { id: 'opt_4', name: '🦵 ระบบ ถอดขาได้ 🦵', price: 2500, condition: '💗สำหรับ TPE เท่านั้น💗', details: '🌟 ข้อดี ง่ายต่อการเคลื่อนย้าย 🌟', image: '', video_url: '', target_material: 'tpe', is_active: 1, order_index: 4 },
  { id: 'opt_5', name: '🔈 ระบบเสียงตุ๊กตาและระบบสัมผัส ✋', price: 4200, condition: '', details: '', image: '', video_url: '', target_material: 'all', is_active: 1, order_index: 5 },
  { id: 'opt_6', name: 'เพิ่มระบบความร้อนภายในตัว', price: 2500, condition: '', details: '❤️ รายละเอียด ❤️ - จะมีความร้อนทั้งตัวยกเว้น หัว มือ และ เท้า', image: '', video_url: '', target_material: 'all', is_active: 1, order_index: 6 },
  { id: 'opt_7', name: 'หน้าอกแบบนุ่มพิเศษ', price: 1500, condition: '', details: '', image: '', video_url: '', target_material: 'all', is_active: 1, order_index: 7 },
  { id: 'opt_8', name: 'ระบบจิมิ ตอดรับ เข้า-ออก', price: 4500, condition: '💗สำหรับตัว TPE เท่านั้น💗', details: '', image: '', video_url: '', target_material: 'tpe', is_active: 1, order_index: 8 },
  { id: 'opt_9', name: '👄 ระบบเสริมสำหรับปากดูด หัว ซิลิโคน', price: 5000, condition: 'หัวซิลิโคน', details: 'เมื่อสั่งออฟชั่น ปากดูด แถมลิ้นกับฟันแบบปกติฟรี (ลิ้นกับฟันแบบสมจริง + 2,500.- บาท เมื่อสั่งคู่กับออฟชั่นนี้)', image: '', video_url: '', target_material: 'silicone', is_active: 1, order_index: 9 },
  { id: 'opt_10', name: '👗 ระบบสะโพก ขยับได้ 👗', price: 6000, condition: '', details: '', image: '', video_url: '', target_material: 'all', is_active: 1, order_index: 10 },
  { id: 'opt_11', name: 'ลิ้นกับฟันแบบสมจริง', price: 3500, condition: '', details: '❣️ ปล. ทางเพจจะแถมลิ้นกับฟันแบบปกติ [ ฟันแบบตุ๊กตาหัวสีทองแบบในคลิปฟรีจ้า ] สำหรับท่านที่ต้องการหัวตุ๊กตาแบบเปิดปากได้', image: '', video_url: '', target_material: 'all', is_active: 1, order_index: 11 },
  { id: 'opt_12', name: 'ข้อต่อนิ้ว/แขน/เท้าแบบสมจริง', price: 5000, condition: '💗สำหรับตุ๊กตาซิลิโคน💗', details: '', image: '', video_url: '', target_material: 'silicone', is_active: 1, order_index: 12 },
  { id: 'opt_13', name: '💗เนื้อยาง TPE แบบใหม่💗', price: 6000, condition: '💗สำหรับตัว TPE เท่านั้น💗', details: '🌟ข้อแตกต่างระว่าง TPE และ NEW TPE และ ซิลิโคน 🌟', image: '', video_url: '', target_material: 'tpe', is_active: 1, order_index: 13 },
  { id: 'opt_14', name: 'ออฟชั่นข้อต่อแขน / ขานิ่มพิเศษ', price: 4000, condition: '[ ไม่สามารถยืนได้ เหมาะสำหรับผู้ใช้งานแบบนอนเท่านั้น ใช้ได้กับเฉพาะเนื้อยาง tpe ]', details: '', image: '', video_url: '', target_material: 'tpe', is_active: 1, order_index: 14 }
];

export function useLiveOptions(includeAll = false) {
  const [options, setOptions] = useState(() => {
    try {
      const local = localStorage.getItem('rbd_options_cache');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultOptions;
  });

  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    try {
      const param = includeAll ? '?all=1&' : '?';
      const res = await fetch(`/api/options.php${param}_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Options API offline');
      const data = await res.json();
      if (data.success && Array.isArray(data.options) && data.options.length > 0) {
        setOptions(data.options);
        localStorage.setItem('rbd_options_cache', JSON.stringify(data.options));
        return data.options;
      }
    } catch (err) {
      console.warn('Using local options cache:', err.message);
    } finally {
      setLoading(false);
    }
    return null;
  }, [includeAll]);

  useEffect(() => {
    fetchOptions();

    const handleOptionsUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setOptions(e.detail);
      }
    };
    window.addEventListener('rbd_options_updated', handleOptionsUpdate);
    return () => {
      window.removeEventListener('rbd_options_updated', handleOptionsUpdate);
    };
  }, [fetchOptions]);

  const updateOptionsState = (newOptions) => {
    setOptions(newOptions);
    try {
      localStorage.setItem('rbd_options_cache', JSON.stringify(newOptions));
      window.dispatchEvent(new CustomEvent('rbd_options_updated', { detail: newOptions }));
    } catch (e) {}
  };

  return {
    options,
    setOptions: updateOptionsState,
    updateOptionsState,
    loading,
    reload: fetchOptions,
    refetch: fetchOptions
  };
}
