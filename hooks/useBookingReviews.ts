// C:\sawa-web\hooks\useBookingReviews.ts

import { useState, useCallback } from "react";
import {
  createBookingReview,
  getVendorReviews,
  getVendorRatingAverage,
  getProductRatingAverage,
} from "@/lib/bookings";
import {
  BookingReview,
  CreateBookingReviewInput,
} from "@/types/booking";

export function useBookingReviewActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState <string | null>(null);

  const submitReview = async (
    input: CreateBookingReviewInput
  ): Promise <boolean> => {
    setLoading(true);
    setError(null);
    try {
      await createBookingReview(input);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر إرسال التقييم";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return { submitReview, loading, error, clearError };
}

export function useVendorRating(vendorId: string) {
  const [reviews, setReviews] = useState <BookingReview[]>([]);
  const [average, setAverage] = useState <number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = useCallback(async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [r, avg] = await Promise.all([
        getVendorReviews(vendorId),
        getVendorRatingAverage(vendorId),
      ]);
      setReviews(r);
      setAverage(avg?.average ?? null);
      setCount(avg?.count ?? 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر جلب التقييمات";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  return { reviews, average, count, loading, error, load };
}

// ==========================================
// PRC-RVW-04 — تقييم السلعة/الصفقة (user_to_product)
// ==========================================

/**
 * هوك عرض متوسط تقييم صفقة/سلعة معينة (PRC-RVW-04)
 * بنفس شكل useVendorRating أعلاه تماماً، لكن بدون مصفوفة reviews
 * لأن واجهة العرض المتفق عليها تحتاج فقط: متوسط التقييم + عدد المقيّمين
 * (⭐ 4.5 (128) بجانب عنوان الصفقة مباشرة — بدون قائمة تعليقات مفصّلة)
 *
 * load() مُغلَّفة بـ useCallback عمداً: هذا الهوك سيُستدعى داخل useEffect
 * في CategoryDealsView.tsx، وبدون useCallback ستكون load دالة جديدة
 * في كل render، ما يكسر مصفوفة الاعتماديات (dependency array) في useEffect
 */
export function useProductRating(dealId: string) {
  const [average, setAverage] = useState <number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = useCallback(async () => {
    if (!dealId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const avg = await getProductRatingAverage(dealId);
      setAverage(avg?.average ?? null);
      setCount(avg?.count ?? 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر جلب تقييم السلعة";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  return { average, count, loading, error, load };
}