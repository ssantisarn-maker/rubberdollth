import { useState, useEffect } from 'react';
import { reviews as fallbackReviews } from '../data/reviews';

export function useLiveReviews() {
  const [reviews, setReviews] = useState(fallbackReviews);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews.php');
      if (!res.ok) throw new Error('Reviews API offline');
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.warn('Using local fallback reviews:', err.message);
      setReviews(fallbackReviews);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveReviews();
  }, []);

  return { reviews, setReviews, reload: fetchLiveReviews, loading, error };
}
