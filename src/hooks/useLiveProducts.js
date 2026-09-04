import { useState, useEffect, useCallback } from 'react';
import { products as fallbackProducts } from '../data/products';

export function useLiveProducts() {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products.php?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('Using local fallback products:', err.message);
      setProducts(fallbackProducts);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveProducts();

    const handleSync = () => {
      fetchLiveProducts();
    };

    window.addEventListener('rbd_products_updated', handleSync);
    return () => {
      window.removeEventListener('rbd_products_updated', handleSync);
    };
  }, [fetchLiveProducts]);

  return { products, setProducts, reload: fetchLiveProducts, loading, error };
}
