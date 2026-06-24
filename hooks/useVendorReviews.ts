// C:\sawa-web\hooks\useVendorReviews.ts

"use client";

import { useState, useEffect } from "react";
import { Review } from "@/types";
import { streamVendorReviews } from "@/lib/vendor";

interface UseVendorReviewsReturn {
  reviews: Review[];
  averageRating: number;
  loading: boolean;
  error: string | null;
}

export const useVendorReviews = (vendorId: string): UseVendorReviewsReturn => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    const unsubscribe = streamVendorReviews(
      vendorId,
      (data) => {
        setReviews(data);
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب التقييمات:", err);
        setError("حدث خطأ في جلب التقييمات");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return { reviews, averageRating, loading, error };
};