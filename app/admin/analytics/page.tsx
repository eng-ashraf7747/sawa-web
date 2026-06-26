// C:\sawa-web\app\admin\analytics\page.tsx

"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { usePlatformOverview, useVendorBreakdown, useCategoryBreakdown, useBookingsList } from "@/hooks/useAdminReports";
import { ReportLevel, BreakdownType, BookingFilters } from "@/types/adminReports";
import { BookingRow } from "@/types/adminReports";

function OverviewLevel({ onDrillDown }: { onDrillDown: (type: BreakdownType) => void }) {
  const { overview, loading, error, reload } = usePlatformOverview();

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-center py-16 text-red-400 text-sm">
      {error}
      <button onClick={reload} className="block mx-auto mt-2 text-[#1a3c6e] underline text-xs">اعادة المحاولة</button>
    </div>
  );

  if (!overview) return null;

  const cards = [
    { label: "اجمالي الحجوزات", value: overview.totalBookings, color: "bg-blue-50 text-blue-700", icon: "📦" },
    { label: "الحجوزات المكتملة", value: overview.completedBookings, color: "bg-green-50 text-green-700", icon: "✅" },
    { label: "في انتظار التسليم", value: overview.pendingBookings, color: "bg-yellow-50 text-yellow-700", icon: "⏳" },
    { label: "ملغية", value: overview.cancelledBookings, color: "bg-red-50 text-red-700", icon: "❌" },
    { label: "اجمالي قيمة الفواتير", value: `${overview.totalRevenue.toLocaleString()} ج`, color: "bg-purple-50 text-purple-700", icon: "💰" },
    { label: "متوسط التقييم", value: overview.avgRating > 0 ? `${overview.avgRating.toFixed(1)} نجوم` : "لا يوجد", color: "bg-amber-50 text-amber-700", icon: "⭐" },
    { label: "عدد الموردين", value: overview.totalVendors, color: "bg-indigo-50 text-indigo-700", icon: "🏪" },
    { label: "عدد المستخدمين", value: overview.totalUsers, color: "bg-teal-50 text-teal-700", icon: "👤" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-4 ${card.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{card.icon}</span>
              <p className="text-xs font-medium opacity-70">{card.label}</p>
            </div>
            <p className="text-2xl font-extrabold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onDrillDown("vendor")}
          className="bg-white border border-gray-100 rounded-2xl p-5 text-right hover:border-[#1a3c6e] hover:shadow-md transition group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏪</span>
            <h3 className="font-bold text-[#1a3c6e]">تفصيل حسب المورد</h3>
          </div>
          <p className="text-gray-400 text-sm">عرض اداء كل مورد بالتفصيل</p>
          <p className="text-[#c9a84c] text-xs mt-2 font-semibold group-hover:underline">عرض التفاصيل</p>
        </button>

        <button
          onClick={() => onDrillDown("category")}
          className="bg-white border border-gray-100 rounded-2xl p-5 text-right hover:border-[#1a3c6e] hover:shadow-md transition group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🗂️</span>
            <h3 className="font-bold text-[#1a3c6e]">تفصيل حسب الفئة</h3>
          </div>
          <p className="text-gray-400 text-sm">عرض اداء كل فئة بالتفصيل</p>
          <p className="text-[#c9a84c] text-xs mt-2 font-semibold group-hover:underline">عرض التفاصيل</p>
        </button>
      </div>
    </div>
  );
}

function BreakdownLevel({
  type,
  onSelectVendor,
  onSelectCategory,
  onBack,
}: {
  type: BreakdownType;
  onSelectVendor: (vendorId: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onBack: () => void;
}) {
  const { vendors, loading: vLoading } = useVendorBreakdown();
  const { categories, loading: cLoading } = useCategoryBreakdown();
  const loading = type === "vendor" ? vLoading : cLoading;

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-[#1a3c6e] text-sm mb-6 hover:underline">
        رجوع للنظرة العامة
      </button>

      {type === "vendor" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <button
              key={v.vendorId}
              onClick={() => onSelectVendor(v.vendorId)}
              className="bg-white border border-gray-100 rounded-2xl p-4 text-right hover:border-[#1a3c6e] hover:shadow-md transition"
            >
              <p className="font-bold text-[#1a3c6e] mb-3">{v.vendorName || "مورد غير محدد"}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 rounded-xl p-2">
                  <p className="text-blue-400">اجمالي الحجوزات</p>
                  <p className="font-bold text-blue-700 text-base">{v.totalBookings}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2">
                  <p className="text-green-400">المكتملة</p>
                  <p className="font-bold text-green-700 text-base">{v.completedBookings}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-2">
                  <p className="text-purple-400">الايراد</p>
                  <p className="font-bold text-purple-700 text-base">{v.totalRevenue.toLocaleString()} ج</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2">
                  <p className="text-amber-400">التقييم</p>
                  <p className="font-bold text-amber-700 text-base">
                    {v.avgRating ? `${v.avgRating.toFixed(1)} نجوم` : "لا يوجد"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {type === "category" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <button
              key={c.categoryId}
              onClick={() => onSelectCategory(c.categoryId)}
              className="bg-white border border-gray-100 rounded-2xl p-4 text-right hover:border-[#1a3c6e] hover:shadow-md transition"
            >
              <p className="font-bold text-[#1a3c6e] mb-3">{c.categoryName || "فئة غير محددة"}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 rounded-xl p-2">
                  <p className="text-blue-400">الحجوزات</p>
                  <p className="font-bold text-blue-700 text-base">{c.totalBookings}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2">
                  <p className="text-green-400">المكتملة</p>
                  <p className="font-bold text-green-700 text-base">{c.completedBookings}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-2">
                  <p className="text-purple-400">الايراد</p>
                  <p className="font-bold text-purple-700 text-base">{c.totalRevenue.toLocaleString()} ج</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ListLevel({
  filters,
  onSelectBooking,
  onBack,
}: {
  filters: BookingFilters;
  onSelectBooking: (booking: BookingRow) => void;
  onBack: () => void;
}) {
  const { bookings, loading, error } = useBookingsList(filters);

  const statusColors: Record <string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    delivered: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusLabels: Record <string, string> = {
    pending: "في انتظار التسليم",
    delivered: "تم التسليم",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-[#1a3c6e] text-sm mb-6 hover:underline">
        رجوع للتفصيل
      </button>

      {error && <div className="text-center py-8 text-red-400 text-sm">{error}</div>}

      {!error && bookings.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">لا توجد عمليات</div>
      )}

      {bookings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f8fafc] border-b border-gray-100">
                <tr>
                  <th className="text-right px-4 py-3 text-[#1a3c6e] font-bold">العرض</th>
                  <th className="text-right px-4 py-3 text-[#1a3c6e] font-bold">المستخدم</th>
                  <th className="text-right px-4 py-3 text-[#1a3c6e] font-bold">المورد</th>
                  <th className="text-right px-4 py-3 text-[#1a3c6e] font-bold">القيمة</th>
                  <th className="text-right px-4 py-3 text-[#1a3c6e] font-bold">الحالة</th>
                  <th className="text-right px-4 py-3 text-[#1a3c6e] font-bold">التاريخ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, i) => (
                  <tr key={booking.id} className={`border-b border-gray-50 hover:bg-[#f8fafc] transition ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-medium text-[#1a3c6e]">{booking.dealTitle}</td>
                    <td className="px-4 py-3 text-gray-600">{booking.userName}</td>
                    <td className="px-4 py-3 text-gray-600">{booking.vendorName}</td>
                    <td className="px-4 py-3 font-bold text-[#1a3c6e]">
                      {booking.orderValue ? `${booking.orderValue.toLocaleString()} ج` : "لا يوجد"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[booking.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[booking.status] ?? booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {booking.createdAt.toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectBooking(booking)}
                        className="text-[#1a3c6e] hover:text-[#c9a84c] text-xs font-bold transition"
                      >
                        تفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailLevel({
  booking,
  onBack,
}: {
  booking: BookingRow;
  onBack: () => void;
}) {
  const statusLabels: Record <string, string> = {
    pending: "في انتظار التسليم",
    delivered: "تم التسليم - في انتظار تاكيد المستخدم",
    completed: "مكتمل",
    cancelled: "ملغي",
  };

  const statusColors: Record <string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    delivered: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-[#1a3c6e] text-sm mb-6 hover:underline">
        رجوع لقائمة العمليات
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#1a3c6e] mb-4 text-base">معلومات العملية</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">رقم الحجز</span>
              <span className="font-mono text-xs text-gray-600">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">العرض</span>
              <span className="font-bold text-[#1a3c6e]">{booking.dealTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">الفئة</span>
              <span>{booking.dealCategory || "غير محدد"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">قناة التواصل</span>
              <span>{booking.contactChannel === "whatsapp" ? "واتساب" : "اتصال هاتفي"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">قيمة الفاتورة</span>
              <span className="font-bold text-[#1a3c6e]">
                {booking.orderValue ? `${booking.orderValue.toLocaleString()} جنيه` : "غير مسجلة"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">عبر احالة</span>
              <span>{booking.isReferral ? "نعم" : "لا"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">الحالة</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[booking.status] ?? ""}`}>
                {statusLabels[booking.status] ?? booking.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-[#1a3c6e] mb-4 text-base">الاطراف والتوقيتات</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">المستخدم</span>
              <span className="font-bold">{booking.userName || "غير محدد"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">المورد</span>
              <span className="font-bold">{booking.vendorName || "غير محدد"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">تاريخ الحجز</span>
              <span>{booking.createdAt.toLocaleDateString("ar-EG")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">تاريخ الاتمام</span>
              <span>{booking.completedAt ? booking.completedAt.toLocaleDateString("ar-EG") : "لم يكتمل بعد"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [level, setLevel] = useState <ReportLevel>("overview");
  const [breakdownType, setBreakdownType] = useState <BreakdownType>("vendor");
  const [filters, setFilters] = useState <BookingFilters>({});
  const [selectedBooking, setSelectedBooking] = useState <BookingRow | null>(null);

  const levelTitles: Record <ReportLevel, string> = {
    overview: "التقارير والتحليلات",
    breakdown: breakdownType === "vendor" ? "تفصيل حسب المورد" : "تفصيل حسب الفئة",
    list: "قائمة العمليات",
    detail: "تفاصيل العملية",
  };

  return (
    <AdminLayout title={levelTitles[level]}>
      <div className="px-4 md:px-6 lg:px-8 py-6" dir="rtl">

        {level === "overview" && (
          <OverviewLevel
            onDrillDown={(type) => {
              setBreakdownType(type);
              setLevel("breakdown");
            }}
          />
        )}

        {level === "breakdown" && (
          <BreakdownLevel
            type={breakdownType}
            onSelectVendor={(vendorId) => {
              setFilters({ vendorId });
              setLevel("list");
            }}
            onSelectCategory={(categoryId) => {
              setFilters({ categoryId });
              setLevel("list");
            }}
            onBack={() => setLevel("overview")}
          />
        )}

        {level === "list" && (
          <ListLevel
            filters={filters}
            onSelectBooking={(booking) => {
              setSelectedBooking(booking);
              setLevel("detail");
            }}
            onBack={() => setLevel("breakdown")}
          />
        )}

        {level === "detail" && selectedBooking && (
          <DetailLevel
            booking={selectedBooking}
            onBack={() => setLevel("list")}
          />
        )}

      </div>
    </AdminLayout>
  );
}