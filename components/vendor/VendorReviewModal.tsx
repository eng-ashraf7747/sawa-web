// C:\sawa-web\components\vendor\VendorReviewModal.tsx

"use client";

import { useState } from "react";
import { Booking } from "@/types/booking";
import { useBookingReviewActions } from "@/hooks/useBookingReviews";

interface Props {
  booking: Booking;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function VendorReviewModal({
  booking,
  onClose,
  onSubmitted,
}: Props) {
  const { submitReview, loading } = useBookingReviewActions();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState <string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { setError("اختر تقييماً للمشتري"); return; }
    setError(null);
    const ok = await submitReview({
      bookingId: booking.id,
      userId: booking.vendorId,
      targetId: booking.userId,
      type: "vendor_to_user",
      rating,
      comment: comment || null,
    });
    if (ok) setDone(true);
    else setError("تعذر إرسال التقييم");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      dir="rtl"
    >
      <div className="bg-white w-full md:w-96 rounded-t-2xl md:rounded-2xl p-6 shadow-xl">

        {!done ? (
          <>
            <h2 className="text-[#1a3c6e] font-bold text-lg mb-1">
              تقييم المشتري
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              كيف كانت تجربتك مع هذا المشتري؟
            </p>

            <div className="flex gap-2 justify-center my-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className={`text-3xl transition ${
                    s <= rating ? "text-[#c9a84c]" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="تعليق اختياري..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-[#1a3c6e]"
            />

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4 bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>

            <button
              onClick={onClose}
              className="w-full mt-3 py-2 text-gray-400 hover:text-gray-600 text-sm transition"
            >
              تخطي
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-[#1a3c6e] font-bold text-lg mb-2">
              تم إرسال التقييم
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              شكراً — تقييمك يساعد في بناء مجتمع سوا
            </p>
            <button
              onClick={onSubmitted}
              className="w-full bg-[#c9a84c] hover:bg-[#b8973b] text-white font-semibold py-3 rounded-xl transition"
            >
              إغلاق
            </button>
          </div>
        )}

      </div>
    </div>
  );
}