// C:\sawa-web\app\admin\requests\page.tsx

"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAllRequests } from "@/hooks/useRequests";
import { fulfillRequest } from "@/lib/requests";
import { Request } from "@/types/request";

export default function AdminRequestsPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const { requests, loading, error, reload } = useAllRequests();
  const [fulfilling, setFulfilling] = useState <string | null>(null);

  const handleFulfill = async (request: Request) => {
    if (!confirm(`هل تريد تحديد طلب "${request.title}" كمُنفَّذ؟`)) return;
    setFulfilling(request.id);
    try {
      await fulfillRequest(request.id, request.subcategoryId);
      reload();
    } finally {
      setFulfilling(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  // تجميع الطلبات بالفئة الفرعية
  const grouped = requests.reduce <Record <string, Request[]>>((acc, req) => {
    const key = `${req.categoryName} — ${req.subcategoryName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {});

  const sortedGroups = Object.entries(grouped).sort(
    (a, b) => b[1].length - a[1].length
  );

  return (
    <AdminLayout title="طلبات المستخدمين">
      <div className="px-4 md:px-6 lg:px-8 py-6" dir="rtl">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">طلبات المستخدمين</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {requests.length} طلب نشط — مرتبة بالأكثر طلباً
            </p>
          </div>
          <button
            onClick={reload}
            className="text-xs text-[#1a3c6e] hover:underline"
          >
            تحديث
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">📋</span>
            <p className="text-[#6b7280] text-sm font-medium">لا توجد طلبات نشطة</p>
          </div>
        )}

        {!loading && sortedGroups.length > 0 && (
          <div className="flex flex-col gap-6">
            {sortedGroups.map(([groupKey, groupRequests]) => (
              <div key={groupKey} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1a3c6e] text-sm">{groupKey}</span>
                    <span className="bg-[#c9a84c] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {groupRequests.length} طلب
                    </span>
                  </div>
                  <button
                    onClick={() => handleFulfill(groupRequests[0])}
                    disabled={fulfilling !== null}
                    className="text-xs bg-green-50 text-green-700 hover:bg-green-100 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    تحديد الكل كمُنفَّذ
                  </button>
                </div>

                <div className="divide-y divide-gray-50">
                  {groupRequests.map((req) => (
                    <div
                      key={req.id}
                      className="px-4 py-3 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1a3c6e] truncate">
                          {req.title}
                        </p>
                        {req.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {req.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {req.userName} — {req.createdAt.toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleFulfill(req)}
                        disabled={fulfilling === req.id}
                        className="flex-shrink-0 text-xs bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {fulfilling === req.id ? "جاري..." : "تنفيذ"}
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}