// C:\sawa-web\app\vendor\transactions\page.tsx

"use client";

import { useVendorGuard } from "@/hooks/useVendorGuard";
import { useVendorStats } from "@/hooks/useVendorStats";
import VendorLayout from "@/components/vendor/VendorLayout";

export default function VendorTransactionsPage() {
  const { isAuthorized, loading: authLoading, vendorId } = useVendorGuard();
  const { transactions, loading } = useVendorStats(vendorId ?? "");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <VendorLayout title="سجل العمليات">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">

        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-base font-bold text-[#0f172a]">العمليات</h2>
          <span className="text-xs text-slate-400">{transactions.length} عملية إجمالاً</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 md:py-16 text-slate-400">
            <span className="text-5xl mb-4">📋</span>
            <p className="text-sm font-medium">الصفحة تحت الإنشاء والتطوير</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between px-3 md:px-4 py-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-[#c9a84c] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{transaction.dealTitle}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {transaction.timestamp
                      ? new Date(
                          (transaction.timestamp as unknown as { seconds: number }).seconds * 1000
                        ).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
                <span className={`
                  text-xs font-bold px-2 md:px-2.5 py-1 rounded-full
                  ${transaction.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : transaction.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-500"
                  }
                `}>
                  {transaction.status === "completed" ? "مكتملة"
                    : transaction.status === "pending" ? "معلقة"
                    : "ملغاة"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
}