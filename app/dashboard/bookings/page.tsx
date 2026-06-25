// C:\sawa-web\app\dashboard\bookings\page.tsx

"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useUserBookings } from "@/hooks/useBookings";
import { useBookingActions } from "@/hooks/useBookings";
import BookingCompletionModal from "@/components/dashboard/BookingCompletionModal";
import { Booking, BOOKING_STATUS_LABELS } from "@/types/booking";

export default function UserBookingsPage() {
  const { userData } = useUser();
  const { bookings, loading, error } = useUserBookings();
  const { complete } = useBookingActions();
  const [selectedBooking, setSelectedBooking] = useState <Booking | null>(null);

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-[#f0f4f8]" dir="rtl">
      <div className="px-4 md:px-6 lg:px-8 py-6" dir="rtl">

        <h1 className="text-[#1a3c6e] font-extrabold text-xl mb-6">
          حجوزاتي
        </h1>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">📦</span>
            <p className="text-[#6b7280] text-sm font-medium">
              لا توجد حجوزات حتى الآن
            </p>
            <p className="text-[#c9a84c] text-xs mt-1">
              احصل على عرض وستظهر حجوزاتك هنا
            </p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking) => {
              const statusColors: Record <string, string> = {
                pending:   "bg-yellow-100 text-yellow-700",
                delivered: "bg-blue-100 text-blue-700",
                completed: "bg-green-100 text-green-700",
                cancelled: "bg-red-100 text-red-700",
              };

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-bold text-[#1a3c6e] text-sm">
                      {booking.dealTitle}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>

                  {booking.orderValue && (
                    <p className="text-sm text-gray-600 mb-3">
                      قيمة الطلب:
                      <span className="font-bold text-[#1a3c6e] mr-1">
                        {booking.orderValue} جنيه
                      </span>
                    </p>
                  )}

                  {booking.status === "delivered" && (
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full bg-[#1a3c6e] hover:bg-[#15306a] text-white text-sm font-semibold py-2 rounded-xl transition"
                    >
                      تأكيد الاستلام وتقييم التجربة
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedBooking && (
          <BookingCompletionModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onCompleted={() => setSelectedBooking(null)}
          />
        )}

      </div>
    </div>
  );
}