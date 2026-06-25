// C:\sawa-web\components\vendor\VendorBookingCard.tsx

"use client";

import { useState } from "react";
import { Booking, BOOKING_STATUS_LABELS, CONTACT_CHANNEL_LABELS } from "@/types/booking";
import { useBookingActions } from "@/hooks/useBookings";

interface Props {
  booking: Booking;
  onUpdated: () => void;
}

export default function VendorBookingCard({ booking, onUpdated }: Props) {
  const { deliver, cancel, loading } = useBookingActions();
  const [orderValue, setOrderValue] = useState("");
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [error, setError] = useState <string | null>(null);

  const handleDeliver = async () => {
    const value = parseFloat(orderValue);
    if (!value || value <= 0) {
      setError("أدخل قيمة صحيحة للفاتورة");
      return;
    }
    setError(null);
    const ok = await deliver(booking.id, { orderValue: value });
    if (ok) onUpdated();
    else setError("تعذر تسجيل التسليم");
  };

  const handleCancel = async () => {
    const ok = await cancel(booking.id);
    if (ok) onUpdated();
  };

  const statusColors: Record <string, string> = {
    pending:   "bg-yellow-100 text-yellow-700",
    delivered: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-[#1a3c6e] text-sm">{booking.dealTitle}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {CONTACT_CHANNEL_LABELS[booking.contactChannel]}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </div>

      {booking.orderValue && (
        <p className="text-sm text-gray-600 mb-3">
          قيمة الفاتورة:
          <span className="font-bold text-[#1a3c6e] mr-1">
            {booking.orderValue} جنيه
          </span>
        </p>
      )}

      {booking.status === "pending" && (
        <>
          {!showDeliverForm ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeliverForm(true)}
                className="flex-1 bg-[#1a3c6e] hover:bg-[#15306a] text-white text-sm font-semibold py-2 rounded-xl transition"
              >
                تم التسليم
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold py-2 rounded-xl transition"
              >
                إلغاء
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <input
                type="number"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
                placeholder="قيمة الفاتورة بالجنيه"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-2 focus:outline-none focus:border-[#1a3c6e]"
              />
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleDeliver}
                  disabled={loading}
                  className="flex-1 bg-[#1a3c6e] hover:bg-[#15306a] text-white text-sm font-semibold py-2 rounded-xl transition"
                >
                  {loading ? "جاري..." : "تأكيد التسليم"}
                </button>
                <button
                  onClick={() => { setShowDeliverForm(false); setError(null); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold py-2 rounded-xl transition"
                >
                  رجوع
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}