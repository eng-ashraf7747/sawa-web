// C:\sawa-web\app\vendor\points\page.tsx

"use client";

import { useVendorGuard } from "@/hooks/useVendorGuard";
import VendorLayout from "@/components/vendor/VendorLayout";

/**
 * صفحة "نقاطي" الخاصة بالمورد — تحت الإنشاء عمداً، بنفس أسلوب أقسام
 * الإعدادات غير المفعَّلة (SectionUnderConstruction) لأن نظام نقاط
 * المورد غير موجود في قاعدة البيانات حالياً؛ لا تُبنى أي واجهة مضلِّلة
 * قبل تصميم النظام الفعلي.
 */
export default function VendorPointsPage() {
  const { isAuthorized, loading } = useVendorGuard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <VendorLayout title="نقاطي">
      <div className="flex flex-col items-center justify-center text-center px-6 py-16 bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-[#f8f9fb] border border-[#e8eaed] flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-[#c9a84c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <span className="text-[10px] font-bold bg-[#c9a84c] text-[#1a3c6e] px-2.5 py-1 rounded-full mb-3">
          قيد الإنشاء
        </span>
        <h2 className="text-base font-bold text-[#0d2447] mb-1">نقاطي</h2>
        <p className="text-sm text-[#6b7280] max-w-sm">
          نظام نقاط خاص بالموردين قيد التجهيز حالياً، وسيتم تفعيله قريباً.
        </p>
      </div>
    </VendorLayout>
  );
}