// C:\sawa-web\components\dashboard\DashboardLayout.tsx

"use client";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useActiveCategories } from "@/hooks/useCategories";
import { useUserBookings } from "@/hooks/useBookings";
import { useBookingActions } from "@/hooks/useBookings";
import { useUserRequests } from "@/hooks/useRequests";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import StatsBar from "./StatsBar";
import RequestsSection from "./RequestsSection";
import PointsSection from "./PointsSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import BookingCompletionModal from "./BookingCompletionModal";
import BookingsFilters from "@/components/shared/BookingsFilters";
import { Booking, BOOKING_STATUS_LABELS } from "@/types/booking";
import { useState as useLocalState } from "react";

type ActiveSection = "home" | "deals" | "requests" | "points" | "profile" | "bookings" | string;

function BookingsSection() {
  const { bookings, loading, error } = useUserBookings();
  const { complete } = useBookingActions();
  const [selectedBooking, setSelectedBooking] = useLocalState <Booking | null>(null);
  const [filteredBookings, setFilteredBookings] = useLocalState<Booking[]>([]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-16 text-red-400 text-sm">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-5xl mb-4">📦</span>
        <p className="text-[#6b7280] text-sm font-medium">لا توجد حجوزات حتى الآن</p>
        <p className="text-[#c9a84c] text-xs mt-1">احصل على عرض وستظهر حجوزاتك هنا</p>
      </div>
    );
  }

  const hasFilteredResults = filteredBookings.length > 0;

  const statusColors: Record <string, string> = {
    pending:   "bg-yellow-100 text-yellow-700",
    delivered: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <>
      <BookingsFilters
        allBookings={bookings}
        onFilterChange={setFilteredBookings}
      />

      {!hasFilteredResults && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-[#6b7280] text-sm font-medium">لا توجد حجوزات تطابق الفلتر المحدد</p>
          <p className="text-[#c9a84c] text-xs mt-1">جرب تغيير الحالات أو الفترة الزمنية</p>
        </div>
      )}

      {hasFilteredResults && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="font-bold text-[#1a3c6e] text-sm">{booking.dealTitle}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[booking.status]}`}>
                  {BOOKING_STATUS_LABELS[booking.status]}
                </span>
              </div>
              {booking.orderValue && (
                <p className="text-sm text-gray-600 mb-3">
                  قيمة الطلب:
                  <span className="font-bold text-[#1a3c6e] mr-1">{booking.orderValue} جنيه</span>
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
          ))}
        </div>
      )}

      {selectedBooking && (
        <BookingCompletionModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCompleted={() => setSelectedBooking(null)}
        />
      )}
    </>
  );
}

function MainContent({
  activeSection,
  onSectionChange,
  userData,
  categoriesCount,
}: {
  activeSection: ActiveSection;
  onSectionChange: (section: string) => void;
  userData: ReturnType <typeof useUser>["userData"];
  categoriesCount: number;
}) {
  const { activeCount } = useUserRequests(userData?.uid ?? "");

  const statsBar = (
    <StatsBar
      userData={userData}
      categoriesCount={categoriesCount}
      requestsCount={activeCount}
      onCardClick={onSectionChange}
      activeSection={activeSection}
    />
  );

  if (activeSection === "deals") {
    return <>{statsBar}<CategoryGrid columns={4} /></>;
  }
  if (activeSection === "requests") {
    return <>{statsBar}<RequestsSection userId={userData?.uid ?? ""} userName={userData?.displayName ?? ""} /></>;
  }
  if (activeSection === "points") {
    return <>{statsBar}<PointsSection userData={userData} /></>;
  }
  if (activeSection === "profile") {
    return (
      <>
        {statsBar}
        <div className="flex-1 bg-white rounded-2xl border border-[#e8eaed] shadow-sm min-h-[400px]" />
      </>
    );
  }
  if (activeSection === "bookings") {
    return (
      <>
        {statsBar}
        <BookingsSection />
      </>
    );
  }

  return (
    <>
      {statsBar}
      <div className="flex flex-col md:flex-row gap-6">
        <CategoryGrid columns={2} />
        <RequestsSection userId={userData?.uid ?? ""} userName={userData?.displayName ?? ""} />
      </div>
    </>
  );
}

export default function DashboardLayout() {
  const { userData, loading } = useUser();
  const { categories } = useActiveCategories();
  const [activePage, setActivePage] = useState("home");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          <p className="text-[#1a3c6e] font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-row bg-[#f0f4f8]" dir="rtl">
      <Sidebar
        userData={userData}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardHeader userData={userData} activePage={activePage} />
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 pb-24 md:pb-8">
          <MainContent
            activeSection={activePage}
            onSectionChange={setActivePage}
            userData={userData}
            categoriesCount={categories.length}
          />
        </main>
      </div>
    </div>
  );
}