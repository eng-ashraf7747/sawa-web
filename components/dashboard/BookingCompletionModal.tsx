// C:\sawa-web\components\dashboard\BookingCompletionModal.tsx

"use client";

import { useState } from "react";
import { Booking } from "@/types/booking";
import { useBookingActions } from "@/hooks/useBookings";
import { useBookingReviewActions } from "@/hooks/useBookingReviews";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Props {
  booking: Booking;
  onClose: () => void;
  onCompleted: () => void;
}

type Step = "confirm" | "review_product" | "review_vendor" | "done";

export default function BookingCompletionModal({
  booking,
  onClose,
  onCompleted,
}: Props) {
  const { complete } = useBookingActions();
  const { submitReview } = useBookingReviewActions();
  const { run, loading: submitting } = useAsyncAction();

  const [step, setStep] = useState <Step>("confirm");
  const [productRating, setProductRating] = useState(0);
  const [vendorRating, setVendorRating] = useState(0);
  const [productComment, setProductComment] = useState("");
  const [vendorComment, setVendorComment] = useState("");
  const [error, setError] = useState <string | null>(null);

  const handleConfirm = async () => {
    if (!confirm("هل تأكدت من استلام الطلب؟")) return;
    await run(async () => {
      const ok = await complete(booking.id);
      if (ok) setStep("review_product");
      else setError("تعذر تأكيد الاستلام");
    });
  };

  const handleProductReview = async () => {
    if (productRating === 0) { setError("اختر تقييماً للسلعة"); return; }
    setError(null);
    await run(async () => {
      await submitReview({
        bookingId: booking.id,
        userId: booking.userId,
        targetId: booking.dealId,
        type: "user_to_product",
        rating: productRating,
        comment: productComment || null,
      });
      setStep("review_vendor");
    });
  };

  const handleVendorReview = async () => {
    if (vendorRating === 0) { setError("اختر تقييماً للبائع"); return; }
    setError(null);
    await run(async () => {
      await submitReview({
        bookingId: booking.id,
        userId: booking.userId,
        targetId: booking.vendorId,
        type: "user_to_vendor",
        rating: vendorRating,
        comment: vendorComment || null,
      });
      setStep("done");
    });
  };

  const StarRow = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex gap-2 justify-center my-4">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          disabled={submitting}
          className={`text-3xl transition disabled:opacity-50 ${
            s <= value ? "text-[#c9a84c]" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      dir="rtl"
    >
      <div className="bg-white w-full md:w-96 rounded-t-2xl md:rounded-2xl p-6 shadow-xl">

        {step === "confirm" && (
          <>
            <h2 className="text-[#1a3c6e] font-bold text-lg mb-2">
              تأكيد الاستلام
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              هل استلمت طلبك من المورد بشكل صحيح؟
            </p>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold py-3 rounded-xl transition mb-3 disabled:opacity-50"
            >
              {submitting ? "جاري التأكيد..." : "نعم، تم الاستلام"}
            </button>
            <button
              onClick={onClose}
              disabled={submitting}
              className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition disabled:opacity-50"
            >
              إلغاء
            </button>
          </>
        )}

        {step === "review_product" && (
          <>
            <h2 className="text-[#1a3c6e] font-bold text-lg mb-1">
              تقييم السلعة
            </h2>
            <p className="text-gray-500 text-sm">كيف كانت جودة المنتج؟</p>
            <StarRow value={productRating} onChange={setProductRating} />
            <textarea
              value={productComment}
              onChange={(e) => setProductComment(e.target.value)}
              placeholder="تعليق اختياري..."
              disabled={submitting}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-[#1a3c6e] disabled:opacity-50"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={handleProductReview}
              disabled={submitting}
              className="w-full mt-4 bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? "جاري الإرسال..." : "التالي"}
            </button>
          </>
        )}

        {step === "review_vendor" && (
          <>
            <h2 className="text-[#1a3c6e] font-bold text-lg mb-1">
              تقييم البائع
            </h2>
            <p className="text-gray-500 text-sm">كيف كانت تجربتك مع البائع؟</p>
            <StarRow value={vendorRating} onChange={setVendorRating} />
            <textarea
              value={vendorComment}
              onChange={(e) => setVendorComment(e.target.value)}
              placeholder="تعليق اختياري..."
              disabled={submitting}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-[#1a3c6e] disabled:opacity-50"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={handleVendorReview}
              disabled={submitting}
              className="w-full mt-4 bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>
          </>
        )}

        {step === "done" && (
          <>
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-[#1a3c6e] font-bold text-lg mb-2">
                شكراً لتقييمك
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                تقييمك يساعد المجتمع على اختيار أفضل الموردين
              </p>
              <button
                onClick={onCompleted}
                className="w-full bg-[#c9a84c] hover:bg-[#b8973b] text-white font-semibold py-3 rounded-xl transition"
              >
                إغلاق
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}