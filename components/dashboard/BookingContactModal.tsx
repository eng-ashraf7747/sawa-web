// C:\sawa-web\components\dashboard\BookingContactModal.tsx

"use client";

import { useState } from "react";
import { Deal } from "@/types/deal";
import { VendorProfile } from "@/types/vendorProfile";
import { ContactChannel } from "@/types/booking";
import { useBookingActions } from "@/hooks/useBookings";
import { useUser } from "@/hooks/useUser";
import { trackEvent } from "@/lib/analytics";

interface Props {
  deal: Deal;
  vendor: VendorProfile;
  onClose: () => void;
  onBooked: (bookingId: string) => void;
}

export default function BookingContactModal({
  deal,
  vendor,
  onClose,
  onBooked,
}: Props) {
  const { userData } = useUser();
  const { book, loading, error } = useBookingActions();
  const [selected, setSelected] = useState <ContactChannel | null>(null);

  const hasWhatsapp = !!vendor.whatsapp;
  const hasPhone = !!vendor.phone;

  const handleContact = async (channel: ContactChannel) => {
    if (!userData?.uid) return;
    setSelected(channel);

    const bookingId = await book({
      userId: userData.uid,
      vendorId: deal.vendorId ?? "",
      dealId: deal.id,
      dealTitle: deal.title,
      dealDiscount: deal.discount ?? "",
      dealCategory: deal.categoryId ?? "",
      userName: userData.displayName ?? "",
      vendorName: vendor.businessName ?? "",
      contactChannel: channel,
      isFirstBooking: false,
      isFirstBookingWithVendor: false,
      isReferral: !!userData.referredBy,
    });

    if (!bookingId) return;

    onBooked(bookingId);

    await trackEvent({
      eventType: channel === "whatsapp"
        ? "booking_contact_whatsapp"
        : "booking_contact_phone",
      userId: userData.uid,
      offerId: deal.id,
      bookingId,
      metadata: {
        dealTitle: deal.title,
        vendorName: vendor.businessName ?? "",
        categoryId: deal.categoryId ?? "",
      },
    });

    if (channel === "whatsapp" && vendor.whatsapp) {
      const msg = encodeURIComponent(
        `مرحباً، أنا مهتم بعرض "${deal.title}" عبر تطبيق سوا`
      );
      window.open(`https://wa.me/${vendor.whatsapp}?text=${msg}`, "_blank");
    } else if (channel === "phone" && vendor.phone) {
      window.open(`tel:${vendor.phone}`);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      dir="rtl"
    >
      <div className="bg-white w-full md:w-96 rounded-t-2xl md:rounded-2xl p-6 shadow-xl">

        <h2 className="text-[#1a3c6e] font-bold text-lg mb-1">
          تواصل مع المورد
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          اختر طريقة التواصل للحصول على عرض
          <span className="font-semibold text-[#1a3c6e]"> {deal.title}</span>
        </p>

        <div className="flex flex-col gap-3">
          {hasWhatsapp && (
            <button
              onClick={() => handleContact("whatsapp")}
              disabled={loading && selected === "whatsapp"}
              className="flex items-center gap-3 w-full bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.833L.057 23.428a.75.75 0 00.921.921l5.595-1.453A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 01-4.952-1.355l-.355-.211-3.676.955.974-3.562-.231-.366A9.693 9.693 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              تواصل عبر واتساب
            </button>
          )}

          {hasPhone && (
            <button
              onClick={() => handleContact("phone")}
              disabled={loading && selected === "phone"}
              className="flex items-center gap-3 w-full bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
              </svg>
              اتصال هاتفي
            </button>
          )}

          {!hasWhatsapp && !hasPhone && (
            <p className="text-center text-gray-400 text-sm py-4">
              لا توجد وسيلة تواصل متاحة لهذا المورد
            </p>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-3">{error}</p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-400 hover:text-gray-600 text-sm transition"
        >
          إلغاء
        </button>

      </div>
    </div>
  );
}