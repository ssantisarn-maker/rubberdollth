import { useState, useEffect } from 'react';
import { products as fallbackProducts } from '../data/products';

export function useLiveProducts() {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products.php');
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (err) {
      console.warn('Using local fallback products:', err.message);
      // Fallback to local products array
      setProducts(fallbackProducts);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveProducts();
  }, []);

  return { products, setProducts, reload: fetchLiveProducts, loading, error };
}
