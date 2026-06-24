// C:\sawa-web\hooks\useVendorStats.ts

"use client";

import { useState, useEffect } from "react";
import { Transaction, VendorStats } from "@/types";
import { streamVendorTransactions, calculateVendorStats } from "@/lib/vendor";

interface UseVendorStatsReturn {
  stats: VendorStats | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export const useVendorStats = (vendorId: string): UseVendorStatsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    const unsubscribe = streamVendorTransactions(
      vendorId,
      (data) => {
        setTransactions(data);
        setStats(calculateVendorStats(data));
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