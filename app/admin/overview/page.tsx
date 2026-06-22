// C:\sawa-web\app\admin\overview\page.tsx

"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAdminStats } from "@/hooks/useAdminStats";
import AdminLayout from "@/components/admin/AdminLayout";

// ─── Stat Card ─────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  sub: string;
  accent?: boolean;
  loading?: boolean;
}

function StatCard({ title, value, sub, accent, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-500 mb-2">{title}</p>
      {loading ? (
        <div className="h-9 w-20 bg-slate-100 rounded-lg animate-pulse mb-2" />
      ) : (
        <p className={`text-3xl font-bold mb-1 ${accent ? "text-[#c9a84c]" : "text-[#0f172a]"}`}>
          {value}
        </p>
      )}
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}

// ─── Overview Page ─────────────────────────────────────────
export default function AdminOverviewPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const { stats, loading: statsLoading, error, refresh } = useAdminStats();

  if (authLoading) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المستخدمين"
          value={stats?.totalUsers.toLocaleString("ar-EG") ?? "—"}
          sub="منذ الإطلاق"
          loading={statsLoading}
        />
        <StatCard
          title="العروض النشطة"
          value={stats?.activeDeals.toLocaleString("ar-EG") ?? "—"}
          sub="بيانات حقيقية قريباً"
          accent
          loading={statsLoading}
        />
        <StatCard
          title="طلبات الاهتمام"
          value={stats?.totalInterests.toLocaleString("ar-EG") ?? "—"}
          sub="بيانات حقيقية قريباً"
          loading={statsLoading}
        />
        <StatCard
          title="المستخدمون الجدد"
          value={stats?.newUsersLast30Days.toLocaleString("ar-EG") ?? "—"}
          sub="آخر 30 يوم"
          loading={statsLoading}
        />
      </div>

      {/* ─── Refresh Button ───────────────────────────────── */}
      <div className="flex justify-end mt-4 mb-6">
        <button
          onClick={refresh}
          disabled={statsLoading}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            bg-white border border-slate-200 text-slate-600
            hover:bg-slate-50 hover:border-[#1a3c6e] hover:text-[#1a3c6e]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 shadow-sm
          "
        >
          <svg
            className={`w-4 h-4 ${statsLoading ? "animate-spin" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {statsLoading ? "جارٍ التحديث..." : "تحديث البيانات"}
        </button>
      </div>

      {/* ─── Error Message ────────────────────────────────── */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

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