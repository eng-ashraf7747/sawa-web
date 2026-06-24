// C:\sawa-web\app\vendor\overview\page.tsx

"use client";

import { useVendorGuard } from "@/hooks/useVendorGuard";
import { useVendorStats } from "@/hooks/useVendorStats";
import VendorLayout from "@/components/vendor/VendorLayout";

export default function VendorOverviewPage() {
  const { isAuthorized, loading: authLoading, vendorId } = useVendorGuard();
  const { stats, loading: statsLoading } = useVendorStats(vendorId ?? "");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <VendorLayout title="لوحة التحكم">

      {/* ─── Stats ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base font-bold text-[#0f172a] mb-4">إجمالي العمليات</h2>
        {statsLoading ? (
          <div className="h-12 w-32 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl md:text-4xl font-extrabold text-[#1a3c6e]">
            {stats?.totalTransactions ?? 0}
            <span className="text-sm font-normal text-slate-400 mr-2">عملية عبر سوا</span>
          </p>
        )}
      </div>

      {/* ─── Deal Stats ──────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
        <h2 className="text-base font-bold text-[#0f172a] mb-4">العمليات على كل عرض</h2>

        {statsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !stats || stats.dealStats.length === 0 ? (
          <div className="flex flex-col items-center py-10 md:py-12 text-slate-400">
            <span className="text-4xl mb-3">📊</span>
            <p className="text-sm">لا توجد عمليات بعد</p>
            <p className="text-xs mt-1">ستظهر هنا عند أول عملية عبر سوا</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.dealStats.map((deal) => (
              <div
                key={deal.dealId}
                className="flex items-center justify-between px-3 md:px-4 py-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <span className="text-sm font-medium text-slate-700">{deal.dealTitle}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-[#1a3c6e]">
                    {deal.transactionCount}
                  </span>
                  <span className="text-xs text-slate-400">عملية</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </VendorLayout>
  );
}