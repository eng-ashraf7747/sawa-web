// C:\sawa-web\hooks\useBookingReviews.ts

import { useState, useCallback } from "react";
import {
  createBookingReview,
  getVendorReviews,
  getVendorRatingAverage,
  getProductRatingAverage,
  getVendorBookings,
  getReviewsGivenByVendor,
  filterBookings,
} from "@/lib/bookings";
import { checkAndIncrementBuyerReportUsage } from "@/lib/vendorProfile";
import {
  BookingReview,
  CreateBookingReviewInput,
  BuyerSummary,
  buildBuyerSummaries,
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

// ==========================================
// تقييم المشترين (vendor_to_user) — صفحة "تقييم المشترين"
// ==========================================

/**
 * هوك يجمع بيانات صفحة "تقييم المشترين" الخاصة بالمورد: حجوزاته
 * (لمعرفة كل مشترٍ تعامل معه وإجمالي فواتيره) + تقييماته لهؤلاء المشترين
 * (لمعرفة متوسط تقييم كل واحد منهم)، ثم يجمّعهما عبر buildBuyerSummaries
 * (دالة نقية من types/booking.ts) في مصفوفة واحدة جاهزة للعرض
 *
 * ملاحظة: نستخدم Promise.allSettled عمداً (وليس Promise.all) — نفس
 * الملاحظة المسجّلة كبند منخفض الأهمية على useVendorRating: لو فشل أحد
 * الاستعلامين، يظل الآخر معروضاً بدلاً من اختفاء الاثنين معاً
 *
 * نطاق التاريخ (fromDate/toDate) يُطبَّق على الحجوزات فقط (Client-Side عبر
 * filterBookings الموجودة أصلاً) — أي "يحدد مين يظهر في القائمة"، بينما
 * متوسط تقييم كل مشترٍ يظل تراكمياً من أول تعامل معه دائماً، بغض النظر
 * عن الفترة المختارة (قرار منتج متعمّد — راجع نقاش التصميم)
 *
 * load() الآن تتحقق أولاً من عدّاد الاستخدام الشهري (checkAndIncrementBuyerReportUsage)
 * قبل أي جلب بيانات فعلي — لو الحد انتهى، تبقى البيانات المعروضة كما هي
 * (قديمة) ولا يُنفَّذ أي طلب جديد لـ Firestore، بدل عرض شاشة فارغة أو خطأ
 */
export function useBuyerSummaries(
  vendorId: string,
  dateRange?: { fromDate: string; toDate: string }
) {
  const [buyers, setBuyers] = useState <BuyerSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState <string | null>(null);
  const [remaining, setRemaining] = useState <number | null>(null);
  const [limitReached, setLimitReached] = useState(false);

  const load = useCallback(async () => {
    if (!vendorId) return;

    setLoading(true);
    setError(null);

    const usage = await checkAndIncrementBuyerReportUsage(vendorId);
    if (!usage.allowed) {
      setLimitReached(true);
      setRemaining(0);
      setLoading(false);
      return;
    }
    setLimitReached(false);
    setRemaining(usage.remaining);

    const [bookingsResult, reviewsResult] = await Promise.allSettled([
      getVendorBookings(vendorId),
      getReviewsGivenByVendor(vendorId),
    ]);

    const allBookings = bookingsResult.status === "fulfilled" ? bookingsResult.value : [];
    const reviews = reviewsResult.status === "fulfilled" ? reviewsResult.value : [];

    if (bookingsResult.status === "rejected" && reviewsResult.status === "rejected") {
      setError("تعذر جلب بيانات المشترين");
    }

    const bookings = dateRange
      ? filterBookings(allBookings, [], dateRange.fromDate, dateRange.toDate)
      : allBookings;

    setBuyers(buildBuyerSummaries(bookings, reviews));
    setLoading(false);
  }, [vendorId, dateRange?.fromDate, dateRange?.toDate]);

  return { buyers, loading, error, remaining, limitReached, load };
}