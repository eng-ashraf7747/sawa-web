// C:\sawa-web\components\vendor\VendorBookingCard.tsx

"use client";

import { useState } from "react";
import { Booking, BOOKING_STATUS_LABELS, CONTACT_CHANNEL_LABELS } from "@/types/booking";
import { useBookingActions, useBuyerContact } from "@/hooks/useBookings";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Props {
  booking: Booking;
  onUpdated: () => void;
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) return ""; 

  return parsedDate.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VendorBookingCard({ booking, onUpdated }: Props) {
  const { deliver, cancel } = useBookingActions();
  const { run, loading } = useAsyncAction();
  const { buyer, loading: buyerLoading } = useBuyerContact(booking.userId);
  const [orderValue, setOrderValue] = useState("");
  const [showDeliverForm, setShowDeliverForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justDelivered, setJustDelivered] = useState(false);
  const [justCancelled, setJustCancelled] = useState(false);

  const handleDeliver = async () => {
    const value = parseFloat(orderValue);
    if (!value || value <= 0) {
      setError("أدخل قيمة صحيحة للفاتورة");
      return;
    }
    if (!confirm(`هل تأكدت من قيمة الفاتورة (${value} جنيه)؟ لا يمكن تعديلها بعد التأكيد`)) return;
    setError(null);
    await run(async () => {
      const ok = await deliver(booking.id, { orderValue: value });
      if (ok) {
        setJustDelivered(true);
        setShowDeliverForm(false);
        onUpdated();
      } else {
        setError("تعذر تسجيل التسليم");
      }
    });
  };

  const handleCancel = async () => {
    if (!confirm("هل تريد إلغاء هذا الطلب؟")) return;
    await run(async () => {
      const ok = await cancel(booking.id);
      if (ok) {
        setJustCancelled(true);
        onUpdated();
      }
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    delivered: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const isStillPending = booking.status === "pending" && !justDelivered && !justCancelled;

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

      {/* ─── بيانات المشتري — لتمييز الأوردر عن غيره بدقة ─── */}
      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <p className="text-sm font-semibold text-gray-700">{booking.userName}</p>
        {buyerLoading ? (
          <div className="h-3 w-32 bg-gray-200 rounded mt-1.5 animate-pulse" />
        ) : (
          <>
            {buyer?.phone && (
              <p className="text-xs text-gray-500 mt-1">📞 {buyer.phone}</p>
            )}
            {buyer?.address && (
              <p className="text-xs text-gray-500 mt-0.5">📍 {buyer.address}</p>
            )}
          </>
        )}
      </div>

      {booking.orderValue && (
        <p className="text-sm text-gray-600 mb-3">
          قيمة الفاتورة:
          <span className="font-bold text-[#1a3c6e] mr-1">
            {booking.orderValue} جنيه
          </span>
        </p>
      )}

      {isStillPending && (
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
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold py-2 rounded-xl transition disabled:opacity-50"
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
                  className="flex-1 bg-[#1a3c6e] hover:bg-[#15306a] text-white text-sm font-semibold py-2 rounded-xl transition disabled:opacity-50"
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

      {justDelivered && booking.status === "pending" && (
        <p className="text-green-600 text-xs font-semibold text-center py-2">
          تم تسجيل التسليم ✓
        </p>
      )}

      {justCancelled && booking.status === "pending" && (
        <p className="text-red-500 text-xs font-semibold text-center py-2">
          تم إلغاء الطلب
        </p>
      )}

      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-50">
        <span>طلب: {formatDateTime(booking.createdAt)}</span>
        {booking.completedAt && (
          <span>استلام: {formatDateTime(booking.completedAt)}</span>
        )}
      </div>

    </div>
  );
}