// C:\sawa-web\app\admin\deals\page.tsx

"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDealsPage() {
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
    <AdminLayout title="إدارة العروض">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">

        {/* ─── Header Row ──────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">العروض</h2>
            <p className="text-xs text-slate-400 mt-0.5">إدارة عروض منصة سوا</p>
          </div>
          <button
            disabled
            className="flex items-center gap-2 bg-[#1a3c6e] text-white text-sm px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
            title="قريباً"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة عرض
          </button>
        </div>

        {/* ─── Empty State ─────────────────────────────────── */}
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg className="w-14 h-14 mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-sm font-medium">لا توجد عروض بعد</p>
          <p className="text-xs mt-1">سيتم تفعيل إضافة العروض في الخطوة القادمة</p>
        </div>

      </div>
    </AdminLayout>
  );
}