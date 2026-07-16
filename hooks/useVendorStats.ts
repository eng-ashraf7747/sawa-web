// C:\sawa-web\hooks\useVendorStats.ts

"use client";

import { useState, useEffect } from "react";
import { Transaction, VendorStats } from "@/types";
import { streamVendorCommissionStats } from "@/lib/vendor";

interface UseVendorStatsReturn {
  stats: VendorStats | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

// ملاحظة معمارية (16 يوليو 2026): تحديث لاستخدام streamVendorCommissionStats
// (يقرأ من commission_ledger الحقيقي) بدل streamVendorTransactions المهجورة.
// حقل transactions يُبقى فارغاً دائماً عمداً — صفحة "سجل العمليات"
// (app/vendor/transactions) مصمَّمة أصلاً من المطوّر كصفحة "تحت الإنشاء"
// بشكل بيانات مختلف تماماً (حالة حجز: مكتملة/معلّقة/ملغاة) لا يطابق حالة
// العمولة الحقيقية (قيد الدفع/مدفوعة/معفاة). إبقاؤها فارغة يحافظ على رسالة
// "الصفحة تحت الإنشاء والتطوير" الأصلية بدل عرض بيانات مضلِّلة.
export const useVendorStats = (vendorId: string): UseVendorStatsReturn => {
  const [transactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    const unsubscribe = streamVendorCommissionStats(
      vendorId,
      (data) => {
        setStats(data);
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب إحصائيات المورد:", err);
        setError("حدث خطأ في جلب البيانات");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  return { stats, transactions, loading, error };
};