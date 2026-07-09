// C:\sawa-web\components\vendor\VendorBookingCard.tsx

"use client";

import { Booking } from "@/types/booking";

interface VendorBookingCardProps {
  booking: Booking;
  onDeliverClick: (booking: Booking) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  delivered: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  delivered: "تم التسليم",
  completed: "مكتمل",
  cancelled: "ملغي",
};

function formatDateTime(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VendorBookingCard({ booking, onDeliverClick }: VendorBookingCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-[#1a3c6e] text-sm">{booking.dealTitle}</p>
          <p className="text-xs text-gray-500 mt-0.5">{booking.userName}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[booking.status] ?? "bg-gray-100 text-gray-600"}`}>
          {statusLabels[booking.status] ?? booking.status}
        </span>
      </div>

      {booking.orderValue && (
        <p className="text-sm text-gray-600 mb-3">
          قيمة الطلب: <span className="font-bold text-[#1a3c6e]">{booking.orderValue} جنيه</span>
        </p>
      )}

      {booking.status === "pending" && (
        <button
          onClick={() => onDeliverClick(booking)}
          className="w-full bg-[#1a3c6e] hover:bg-[#15306a] text-white text-sm font-semibold py-2 rounded-xl transition mb-3"
        >
          تأكيد التسليم
        </button>
      )}

      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-auto pt-2 border-t border-gray-50">
        <span>طلب: {formatDateTime(booking.createdAt)}</span>
        {booking.completedAt && (
          <span>استلام: {formatDateTime(booking.completedAt)}</span>
        )}
      </div>
    </div>
  );
}