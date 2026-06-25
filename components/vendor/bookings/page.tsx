// C:\sawa-web\app\vendor\bookings\page.tsx

"use client";

import { useState } from "react";
import { useVendorGuard } from "@/hooks/useVendorGuard";
import { useVendorBookings } from "@/hooks/useBookings";
import VendorLayout from "@/components/vendor/VendorLayout";
import VendorBookingCard from "@/components/vendor/VendorBookingCard";
import VendorReviewModal from "@/components/vendor/VendorReviewModal";
import { Booking } from "@/types/booking";

export default function VendorBookingsPage() {
  const { isAuthorized, loading: authLoading, vendorId } = useVendorGuard();
  const { bookings, loading, error, } = useVendorBookings(
    isAuthorized && vendorId ? vendorId : ""
  );
  const [reviewBooking, setReviewBooking] = useState <Booking | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <VendorLayout title="الحجوزات">

      <div className="px-4 md:px-6 lg:px-8 py-6" dir="rtl">

        <h1 className="text-[#1a3c6e] font-extrabold text-xl mb-6">
          الحجوزات
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
            <span className="text-5xl mb-4">📋</span>
            <p className="text-[#6b7280] text-sm font-medium">
              لا توجد حجوزات حتى الآن
            </p>
            <p className="text-[#c9a84c] text-xs mt-1">
              ستظهر الحجوزات هنا عندما يتواصل معك العملاء
            </p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking) => (
              <VendorBookingCard
                key={booking.id}
                booking={booking}
                onUpdated={() => {
                  if (booking.status === "pending") {
                    setReviewBooking(booking);
                  }
                }}
              />
            ))}
          </div>
        )}

        {reviewBooking && (
          <VendorReviewModal
            booking={reviewBooking}
            onClose={() => setReviewBooking(null)}
            onSubmitted={() => setReviewBooking(null)}
          />
        )}

      </div>
    </VendorLayout>
  );
}