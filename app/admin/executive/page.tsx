// C:\sawa-web\app\admin\executive\page.tsx

"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useExecutiveDashboard } from "@/hooks/useExecutiveDashboard";

function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: {
  startDate: Date;
  endDate: Date;
  onStartChange: (d: Date) => void;
  onEndChange: (d: Date) => void;
}) {
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  return (
    <div className="flex flex-wrap items-center gap-3" dir="rtl">
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-500">من:</label>
        <input
          type="date"
          value={fmt(startDate)}
          onChange={(e) => onStartChange(new Date(e.target.value))}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1a3c6e] [direction:ltr]"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-500">إلى:</label>
        <input
          type="date"
          value={fmt(endDate)}
          onChange={(e) => onEndChange(new Date(e.target.value))}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1a3c6e] [direction:ltr]"
        />
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  color = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "gold" | "green" | "red";
}) {
  const colors = {
    blue:  "border-t-[#1a3c6e] text-[#1a3c6e]",
    gold:  "border-t-[#c9a84c] text-[#c9a84c]",
    green: "border-t-green-500 text-green-600",
    red:   "border-t-red-400 text-red-500",
  };

  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 border-t-4 ${colors[color]}`}>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${colors[color].split(" ")[1]}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-base font-bold text-[#1a3c6e] border-b border-slate-100 pb-2 mb-4">
      {title}
    </h2>
  );
}

export default function ExecutiveDashboardPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [startDate, setStartDate] = useState <Date>(firstOfMonth);
  const [endDate, setEndDate] = useState <Date>(now);

  const { summary, loading, error } = useExecutiveDashboard(startDate, endDate);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <AdminLayout title="لوحة المتابعة التنفيذية">
      <div className="px-4 md:px-6 lg:px-8 py-6" dir="rtl">

        {/* ─── Date Range ─── */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#1a3c6e]">نطاق التقرير</p>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
          />
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && summary && (
          <div className="flex flex-col gap-8">

            {/* ─── المستخدمون والموردون ─── */}
            <div>
              <SectionTitle title="المستخدمون والموردون" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="إجمالي المستخدمين" value={summary.totalUsers} color="blue" />
                <KPICard label="مستخدمون نشطون" value={summary.activeUsers} color="green" />
                <KPICard label="إجمالي الموردين" value={summary.totalVendors} color="blue" />
                <KPICard label="موردون نشطون" value={summary.activeVendors} color="green" />
              </div>
            </div>

            {/* ─── العمليات ─── */}
            <div>
              <SectionTitle title="العمليات" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="إجمالي الحجوزات" value={summary.totalBookings} color="blue" />
                <KPICard label="عمليات مكتملة" value={summary.completedBookings} color="green" />
                <KPICard label="عمليات ملغاة" value={summary.cancelledBookings} color="red" />
                <KPICard
                  label="معدل التحويل"
                  value={`${summary.conversionRate}%`}
                  sub="مشاهدة → إتمام"
                  color="gold"
                />
              </div>
            </div>

            {/* ─── المالية ─── */}
            <div>
              <SectionTitle title="المالية" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  label="إجمالي قيمة الفواتير"
                  value={`${summary.totalInvoiceValue.toLocaleString("ar-EG")} ج`}
                  color="gold"
                />
                <KPICard
                  label="العمولة المستحقة لسوا"
                  value={`${summary.totalCommissionDue.toLocaleString("ar-EG")} ج`}
                  color="green"
                />
                <KPICard
                  label="متوسط قيمة الفاتورة"
                  value={`${summary.averageInvoiceValue.toLocaleString("ar-EG")} ج`}
                  color="blue"
                />
                <KPICard
                  label="أكثر فئة نشاطاً"
                  value={summary.topCategory}
                  color="gold"
                />
              </div>
            </div>

            {/* ─── النقاط ─── */}
            <div>
              <SectionTitle title="اقتصاد النقاط" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard
                  label="نقاط ممنوحة"
                  value={summary.totalPointsGranted.toLocaleString("ar-EG")}
                  sub={`قيمة: ${(summary.totalPointsGranted * 0.5).toLocaleString("ar-EG")} ج`}
                  color="blue"
                />
                <KPICard
                  label="نقاط مستخدمة"
                  value={summary.totalPointsRedeemed.toLocaleString("ar-EG")}
                  color="gold"
                />
                <KPICard
                  label="تكلفة النقاط على سوا"
                  value={`${summary.pointsCost.toLocaleString("ar-EG")} ج`}
                  color="red"
                />
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}