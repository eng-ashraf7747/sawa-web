// C:\sawa-web\app\vendor\reviews\page.tsx

"use client";

import { useVendorGuard } from "@/hooks/useVendorGuard";
import { useVendorReviews } from "@/hooks/useVendorReviews";
import VendorLayout from "@/components/vendor/VendorLayout";

// ─── Star Rating ───────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-[#c9a84c]" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

export default function VendorReviewsPage() {
  const { isAuthorized, loading: authLoading, vendorId } = useVendorGuard();
  const { reviews, averageRating, loading } = useVendorReviews(vendorId ?? "");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <VendorLayout title="التقييمات">

      {/* ─── Average Rating ──────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base font-bold text-[#0f172a] mb-4">متوسط التقييم</h2>
        {loading ? (
          <div className="h-12 w-40 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-4xl md:text-5xl font-extrabold text-[#1a3c6e]">
              {averageRating.toFixed(1)}
            </span>
            <div>
              <StarRating rating={Math.round(averageRating)} />
              <p className="text-xs text-slate-400 mt-1">{reviews.length} تقييم</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Reviews List ────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
        <h2 className="text-base font-bold text-[#0f172a] mb-4">تعليقات العملاء</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center py-12 md:py-16 text-slate-400">
            <span className="text-5xl mb-4">⭐</span>
            <p className="text-sm font-medium">لا توجد تقييمات بعد</p>
            <p className="text-xs mt-1">ستظهر هنا تقييمات عملائك</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-slate-400">
                    {review.timestamp
                      ? new Date(
                          (review.timestamp as unknown as { seconds: number }).seconds * 1000
                        ).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-1">{review.dealTitle}</p>
                {review.comment && (
                  <p className="text-sm text-slate-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </VendorLayout>
  );
}