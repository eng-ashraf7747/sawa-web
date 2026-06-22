// C:\sawa-web\hooks\useAdminStats.ts

"use client";

import { useState, useEffect } from "react";
import { collection, getCountFromServer, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AdminStats {
  totalUsers: number;
  newUsersLast30Days: number;
  activeDeals: number;
  totalInterests: number;
}

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const fetchStats = async (): Promise<AdminStats> => {
  const usersRef = collection(db, "users");

  // ─── إجمالي المستخدمين ────────────────────────────────
  const totalSnapshot = await getCountFromServer(usersRef);
  const totalUsers = totalSnapshot.data().count;

  // ─── المستخدمون الجدد خلال 30 يوم ───────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersQuery = query(
    usersRef,
    where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );
  const newUsersSnapshot = await getCountFromServer(newUsersQuery);
  const newUsersLast30Days = newUsersSnapshot.data().count;

  return {
    totalUsers,
    newUsersLast30Days,
    activeDeals: 0,      // ← يُفعَّل مع إدارة العروض
    totalInterests: 0,   // ← يُفعَّل مع نظام الاهتمام
  };
};

export const useAdminStats = (): UseAdminStatsReturn => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (e) {
      console.error("خطأ في جلب إحصائيات الأدمن:", e);
      setError("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  // جلب تلقائي عند تحميل الصفحة
  useEffect(() => {
    refresh();
  }, []);

  return { stats, loading, error, refresh };
};