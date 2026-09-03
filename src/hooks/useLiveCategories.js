import { useState, useEffect, useCallback } from 'react';

const defaultCategories = [
  { id: 'all', label_th: 'สินค้าทั้งหมด', label_en: 'All Masterpieces', order_index: 1 },
  { id: 'ready', label_th: 'สินค้าพร้อมส่ง (ไทย)', label_en: 'Ready to Ship (TH)', order_index: 2 },
  { id: 'toys', label_th: 'ของเล่นสำหรับผู้ใหญ่', label_en: 'Adult Toys', order_index: 3 },
  { id: 'anime', label_th: 'ตุ๊กตาซิลิโคน สาวสวยและอนิเมะ การ์ตูน', label_en: 'Anime & Fantasy', order_index: 4 },
  { id: 'western', label_th: 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวฝรั่ง / ยุโรป', label_en: 'Western / European', order_index: 5 },
  { id: 'asian', label_th: 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวเอเชีย', label_en: 'Asian Aesthetics', order_index: 6 },
  { id: 'torso', label_th: 'ตุ๊กตายางครึ่งตัว TORSO', label_en: 'Torso & Half Body', order_index: 7 },
  { id: 'reviews', label_th: 'รีวิวตุ๊กตายางจากลูกค้า', label_en: 'Customer Reviews', order_index: 8 },
];

export function useLiveCategories() {
  const [categories, setCategories] = useState(() => {
    try {
      const local = localStorage.getItem('rbd_categories_cache');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return defaultCategories;
  });

  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/categories.php?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Categories API offline');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
        localStorage.setItem('rbd_categories_cache', JSON.stringify(data.categories));
        return data.categories;
      }
    } catch (err) {
      console.warn('Using local categories cache:', err.message);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    fetchCategories();

    // Listen for custom category update events across components
    const handleCategoryUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCategories(e.detail);
      }
    };
    window.addEventListener('rbd_categories_updated', handleCategoryUpdate);
    return () => {
      window.removeEventListener('rbd_categories_updated', handleCategoryUpdate);
    };
  }, [fetchCategories]);

  const updateCategoriesState = (newCats) => {
    setCategories(newCats);
    try {
      localStorage.setItem('rbd_categories_cache', JSON.stringify(newCats));
      window.dispatchEvent(new CustomEvent('rbd_categories_updated', { detail: newCats }));
    } catch (e) {}
  };

  return {
    categories,
    setCategories: updateCategoriesState,
    reload: fetchCategories,
    loading
  };
}
