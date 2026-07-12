// C:\sawa-web\app\vendor\customers\page.tsx

"use client";

import { useState } from "react";
import { useVendorGuard } from "@/hooks/useVendorGuard";
import { useBuyerSummaries } from "@/hooks/useBookingReviews";
import { getDefaultDateRange } from "@/lib/bookings";
import VendorLayout from "@/components/vendor/VendorLayout";

type SortKey = "rating_desc" | "rating_asc" | "name_asc" | "invoice_desc";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "text-[#c9a84c]" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

export default function VendorCustomersPage() {
  const { isAuthorized, loading: authLoading, vendorId } = useVendorGuard();

  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [sortKey, setSortKey] = useState <SortKey>("rating_desc");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { buyers, loading, error, remaining, limitReached, load } =
    useBuyerSummaries(vendorId ?? "", { fromDate, toDate });

  const handleRefresh = async () => {
    await load();
    setHasLoadedOnce(true);
  };

  const overallAverage = (() => {
    const totalCount = buyers.reduce((sum, b) => sum + b.ratingCount, 0);
    if (totalCount === 0) return null;
    const totalSum = buyers.reduce(
      (sum, b) => sum + (b.averageRating !== null ? b.averageRating * b.ratingCount : 0),
      0
    );
    return { average: totalSum / totalCount, count: totalCount };
  })();

  const sortedBuyers = (() => {
    const list = [...buyers];
    switch (sortKey) {
      case "rating_desc":
        return list.sort((a, b) => (b.averageRating ?? -1) - (a.averageRating ?? -1));
      case "rating_asc":
        return list.sort((a, b) => {
          if (a.averageRating === null) return 1;
          if (b.averageRating === null) return -1;
          return a.averageRating - b.averageRating;
        });
      case "name_asc":
        return list.sort((a, b) => a.userName.localeCompare(b.userName, "ar"));
      case "invoice_desc":
        return list.sort((a, b) => b.totalInvoiceValue - a.totalInvoiceValue);
      default:
        return list;
    }
  })();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <VendorLayout title="تقييم المشترين">

      {/* ─── Date Range + Refresh ─────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">من تاريخ</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1a3c6e]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1a3c6e]"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || limitReached}
            className="px-5 py-2 rounded-lg bg-[#1a3c6e] text-white text-sm font-bold hover:bg-[#1a3c6e]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "جاري التحديث..." : "تحديث البيانات"}
          </button>
        </div>
        {remaining !== null && !limitReached && (
          <p className="text-xs text-slate-400 mt-2">متبقي {remaining} من 5 تحديثات هذا الشهر</p>
        )}
        {limitReached && (
          <p className="text-xs text-amber-600 mt-2 font-medium">
            استنفدت الحد الأقصى من التحديثات هذا الشهر (5) — البيانات المعروضة قد تكون قديمة، وستتاح تحديثات جديدة الشهر القادم
          </p>
        )}
      </div>

      {/* ─── Overall Average ──────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base font-bold text-[#0f172a] mb-4">متوسط تقييمك لعملائك</h2>
        {!hasLoadedOnce ? (
          <p className="text-sm text-slate-400">اضغط "تحديث البيانات" لعرض النتائج</p>
        ) : loading ? (
          <div className="h-12 w-40 bg-slate-100 rounded-lg animate-pulse" />
        ) : overallAverage !== null ? (
          <div className="flex items-center gap-4">
            <span className="text-4xl md:text-5xl font-extrabold text-[#1a3c6e]">
              {overallAverage.average.toFixed(1)}
            </span>
            <div>
              <StarRating rating={overallAverage.average} />
              <p className="text-xs text-slate-400 mt-1">{overallAverage.count} تقييم لعملاء مختلفين</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">لسه معملتش أي تقييم لأي مشترٍ</p>
        )}
      </div>

      {/* ─── Buyers Table ────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-[#0f172a]">قائمة المشترين</h2>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#1a3c6e]"
          >
            <option value="rating_desc">الأعلى تقييماً</option>
            <option value="rating_asc">الأقل تقييماً</option>
            <option value="name_asc">أبجدياً بالاسم</option>
            <option value="invoice_desc">الأعلى في إجمالي الفواتير</option>
          </select>
        </div>

        {!hasLoadedOnce ? (
          <div className="flex flex-col items-center py-12 md:py-16 text-slate-400">
            <span className="text-5xl mb-4">👥</span>
            <p className="text-sm font-medium">اضغط "تحديث البيانات" فوق لعرض قائمة عملائك</p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : sortedBuyers.length === 0 ? (
          <div className="flex flex-col items-center py-12 md:py-16 text-slate-400">
            <span className="text-5xl mb-4">👥</span>
            <p className="text-sm font-medium">لا يوجد مشترون في هذه الفترة</p>
            <p className="text-xs mt-1">جرّب توسيع نطاق التاريخ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs">
                  <th className="text-right py-2 font-medium">المشتري</th>
                  <th className="text-right py-2 font-medium">عدد المعاملات</th>
                  <th className="text-right py-2 font-medium">إجمالي الفواتير</th>
                  <th className="text-right py-2 font-medium">تقييمك له</th>
                </tr>
              </thead>
              <tbody>
                {sortedBuyers.map((buyer) => (
                  <tr key={buyer.userId} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-medium text-slate-800">{buyer.userName}</td>
                    <td className="py-3 text-slate-600">{buyer.transactionCount}</td>
                    <td className="py-3 text-slate-600">{buyer.totalInvoiceValue.toFixed(0)} ج.م</td>
                    <td className="py-3">
                      {buyer.averageRating !== null ? (
                        <div className="flex items-center gap-2">
                          <StarRating rating={buyer.averageRating} />
                          <span className="text-xs text-slate-400">
                            ({buyer.ratingCount})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">لم تُقيَّم بعد</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </VendorLayout>
  );
}