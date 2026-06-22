// C:\sawa-web\app\admin\overview\page.tsx

"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

// ─── Stat Card ─────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  sub: string;
  accent?: boolean;
}

function StatCard({ title, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <p className={`text-3xl font-bold mb-1 ${accent ? "text-[#c9a84c]" : "text-[#0f172a]"}`}>
        {value}
      </p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}

// ─── Overview Page ─────────────────────────────────────────
export default function AdminOverviewPage() {
  const { isAuthorized, loading } = useAdminGuard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <AdminLayout title="لوحة التحكم">

      {/* ─── Stats Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="إجمالي المستخدمين"
          value="—"
          sub="بيانات حقيقية قريباً"
        />
        <StatCard
          title="العروض النشطة"
          value="—"
          sub="بيانات حقيقية قريباً"
          accent
        />
        <StatCard
          title="طلبات الاهتمام"
          value="—"
          sub="بيانات حقيقية قريباً"
        />
        <StatCard
          title="المستخدمون الجدد"
          value="—"
          sub="آخر 30 يوم"
        />
      </div>

      {/* ─── Recent Activity ─────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-bold text-[#0f172a] mb-4">آخر النشاطات</h2>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <svg className="w-12 h-12 mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">لا توجد نشاطات بعد</p>
          <p className="text-xs mt-1">ستظهر هنا بيانات حقيقية في الإصدار القادم</p>
        </div>
      </div>

    </AdminLayout>
  );
}