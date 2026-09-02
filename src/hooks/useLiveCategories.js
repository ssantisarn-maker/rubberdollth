import { useState, useEffect } from 'react';

const defaultCategories = [
  { id: 'all', label_th: 'สินค้าทั้งหมด', label_en: 'All Masterpieces', order_index: 1 },
  { id: 'ready', label_th: 'สินค้าพร้อมส่ง (ไทย)', label_en: 'Ready to Ship (TH)', order_index: 2 },
  { id: 'asian', label_th: 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวเอเชีย', label_en: 'Asian Aesthetics', order_index: 3 },
  { id: 'western', label_th: 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวฝรั่ง / ยุโรป', label_en: 'Western / European', order_index: 4 },
  { id: 'anime', label_th: 'ตุ๊กตาซิลิโคน สาวสวยและอนิเมะ การ์ตูน', label_en: 'Anime & Fantasy', order_index: 5 },
  { id: 'torso', label_th: 'ตุ๊กตายางครึ่งตัว TORSO', label_en: 'Torso & Half Body', order_index: 6 },
  { id: 'toys', label_th: 'ของเล่นสำหรับผู้ใหญ่ & อุปกรณ์เสริม', label_en: 'Adult Toys & Accessories', order_index: 7 },
  { id: 'reviews', label_th: 'รีวิวตุ๊กตายางจากลูกค้า', label_en: 'Customer Reviews', order_index: 8 },
];

let globalCategoriesPromise = null;
let lastFetchTime = 0;

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

  const fetchCategories = async (force = false) => {
    const now = Date.now();
    if (!force && globalCategoriesPromise) return globalCategoriesPromise;
    if (!force && now - lastFetchTime < 10000) return;

    setLoading(true);
    globalCategoriesPromise = (async () => {
      try {
        const res = await fetch('/api/categories.php');
        if (!res.ok) throw new Error('Categories API offline');
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          localStorage.setItem('rbd_categories_cache', JSON.stringify(data.categories));
          lastFetchTime = Date.now();
          return data.categories;
        }
      } catch (err) {
        console.warn('Using local categories cache:', err.message);
      } finally {
        setLoading(false);
        globalCategoriesPromise = null;
      }
      return null;
    })();

    return globalCategoriesPromise;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const updateCategoriesState = (newCats) => {
    setCategories(newCats);
    try {
      localStorage.setItem('rbd_categories_cache', JSON.stringify(newCats));
    } catch (e) {}
  };

  return {
    categories,
    setCategories: updateCategoriesState,
    reload: () => fetchCategories(true),
    loading
  };
}
