// C:\sawa-web\components\dashboard\DashboardLayout.tsx

"use client";
import { useState, useEffect, useCallback } from "react";
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
import ProfileSection from "./ProfileSection";
import NotificationPrefsSection from "./NotificationPrefsSection";
import { requestNotificationPermissionAndToken, saveDeviceToken } from "@/lib/messaging";
import CategoryGrid from "@/components/home/CategoryGrid";
import CategoryDealsView from "./CategoryDealsView";
import BookingCompletionModal from "./BookingCompletionModal";
import BookingsFilters from "@/components/shared/BookingsFilters";
import VendorProfileCard from "@/components/vendor/VendorProfileCard";
import { Booking, BOOKING_STATUS_LABELS } from "@/types/booking";

type ActiveSection = "home" | "deals" | "requests" | "points" | "profile" | "bookings" | string;

interface DashboardLayoutProps {
  initialCategoryId?: string;
}

function BookingsSection() {
  const { bookings, loading, error } = useUserBookings();
  const { complete } = useBookingActions();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<{ vendorId: string; vendorName: string } | null>(null);

  useEffect(() => {
    setFilteredBookings(bookings);
  }, [bookings]);

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

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
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
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[booking.status] || "bg-gray-100 text-gray-600"}`}>
                  {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                </span>
              </div>

              {booking.vendorId && booking.vendorName && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-sm font-semibold text-gray-700">
                    🏪 {booking.vendorName}
                  </p>
                  <button
                    onClick={() => setSelectedVendor({ vendorId: booking.vendorId, vendorName: booking.vendorName })}
                    className="text-[10px] font-bold text-[#1a3c6e] hover:text-[#c9a84c] transition-colors flex-shrink-0"
                  >
                    تفاصيل المورد
                  </button>
                </div>
              )}

              {booking.orderValue && (
                <p className="text-sm text-gray-600 mb-3">
                  قيمة الطلب: <span className="font-bold text-[#1a3c6e]">{booking.orderValue} جنيه</span>
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

      {selectedVendor && (
        <VendorProfileCard
          vendorId={selectedVendor.vendorId}
          vendorName={selectedVendor.vendorName}
          onClose={() => setSelectedVendor(null)}
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
  purchasesCount,
  selectedCategoryId,
  onCategoryChange,
  onSelectCategoryFromHome,
}: {
  activeSection: ActiveSection;
  onSectionChange: (section: string) => void;
  userData: ReturnType<typeof useUser>["userData"];
  categoriesCount: number;
  purchasesCount: number;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onSelectCategoryFromHome: (categoryId: string) => void;
}) {
  const { activeCount } = useUserRequests(userData?.uid ?? "");

  const statsBar = (
    <StatsBar
      userData={userData}
      categoriesCount={categoriesCount}
      requestsCount={activeCount}
      purchasesCount={purchasesCount}
      onCardClick={onSectionChange}
      activeSection={activeSection}
    />
  );

  if (activeSection === "deals") {
    return (
      <>
        {statsBar}
        {selectedCategoryId ? (
          <CategoryDealsView
            categoryId={selectedCategoryId}
            onBack={() => onCategoryChange(null)}
          />
        ) : (
          <CategoryGrid columns={4} onSelectCategory={onCategoryChange} />
        )}
      </>
    );
  }

  if (activeSection === "requests") {
    return <>{statsBar}<RequestsSection userId={userData?.uid ?? ""} userName={userData?.displayName ?? ""} userCity={userData?.city ?? "fayoum"} /></>;
  }

  if (activeSection === "points") {
    return <>{statsBar}<PointsSection userData={userData} /></>;
  }

  if (activeSection === "profile") {
    return (
      <>
        {statsBar}
        <ProfileSection />
        <NotificationPrefsSection />
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
        <CategoryGrid columns={2} onSelectCategory={onSelectCategoryFromHome} />
        <RequestsSection userId={userData?.uid ?? ""} userName={userData?.displayName ?? ""} userCity={userData?.city ?? "fayoum"} />
      </div>
    </>
  );
}

export default function DashboardLayout({ initialCategoryId }: DashboardLayoutProps = {}) {
  const { userData, loading } = useUser();
  const { categories } = useActiveCategories();
  const { bookings } = useUserBookings();
  const [showReloadHint, setShowReloadHint] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [activePage, setActivePage] = useState<ActiveSection>(initialCategoryId ? "deals" : "home");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId ?? null);

  const handleNavigate = useCallback((section: string) => {
    setActivePage(section);
    if (section === "deals") {
      setSelectedCategoryId(null);
    }
  }, []);

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleSelectCategoryFromHome = useCallback((categoryId: string) => {
    setActivePage("deals");
    setSelectedCategoryId(categoryId);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setShowReloadHint(true), 6000);
    return () => clearTimeout(timer);
  }, [loading]);

  // ملاحظة معمارية (21 يوليو 2026): طلب إذن الإشعارات تلقائياً وبصمت
  // بعد تحميل بيانات المستخدم، بدلاً من الاعتماد على صفحة اختبار يدوية.
  // الشرط "default فقط" يمنع إزعاج المستخدم بطلب متكرر إذا سبق واتخذ
  // قراراً (سواء بالموافقة أو الرفض) — يُطلب مرة واحدة منطقياً في
  // حياة الحساب على هذا الجهاز تحديداً. تأخير 3 ثوانٍ لإعطاء المستخدم
  // فرصة يرى الصفحة أولاً قبل ظهور نافذة الإذن.
  useEffect(() => {
    if (!userData?.uid) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    const timer = setTimeout(async () => {
      const token = await requestNotificationPermissionAndToken();
      if (token) {
        await saveDeviceToken(userData.uid, token).catch((err) => {
          console.error("فشل حفظ توكن الإشعارات:", err);
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [userData?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          <p className="text-[#1a3c6e] font-semibold">جاري التحميل...</p>
          {showReloadHint && (
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[#1a3c6e] font-semibold underline cursor-pointer"
            >
              الصفحة بتاخد وقت أطول من المعتاد — اضغط هنا لإعادة التحميل
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-row bg-[#f0f4f8]" dir="rtl">
      <Sidebar
        userData={userData}
        activePage={activePage}
        onNavigate={handleNavigate}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardHeader
          userData={userData}
          activePage={activePage}
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 pb-24 md:pb-8">
          <MainContent
            activeSection={activePage}
            onSectionChange={handleNavigate}
            userData={userData}
            categoriesCount={categories.length}
            purchasesCount={bookings.length}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
            onSelectCategoryFromHome={handleSelectCategoryFromHome}
          />
        </main>
      </div>
    </div>
  );
}