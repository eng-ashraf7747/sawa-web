// C:\sawa-web\hooks\useDeals.ts

"use client";

import { useState, useEffect } from "react";
import { Deal } from "@/types/deal";
import { streamDealsByCategory, streamActiveDealsByCategory } from "@/lib/deals";

interface UseDealsReturn {
  deals: Deal[];
  loading: boolean;
  error: string | null;
}

// ─── Admin: كل العروض تحت فئة ────────────────────────────
export const useAllDeals = (categoryId: string): UseDealsReturn => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;

    const unsubscribe = streamDealsByCategory(
      categoryId,
      (data) => {
        setDeals(data);
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب العروض:", err);
        setError("حدث خطأ في جلب العروض");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryId]);

  return { deals, loading, error };
};

// ─── User: العروض النشطة فقط تحت فئة ────────────────────
export const useActiveDeals = (categoryId: string): UseDealsReturn => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;

    const unsubscribe = streamActiveDealsByCategory(
      categoryId,
      (data) => {
        setDeals(data);
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب العروض النشطة:", err);
        setError("حدث خطأ في جلب العروض");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [categoryId]);

  return { deals, loading, error };
};