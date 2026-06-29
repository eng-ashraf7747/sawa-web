// C:\sawa-web\hooks\useExecutiveDashboard.ts

"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTotalCommissionDue } from "@/lib/commissionLedger";
import { getTotalPointsGranted, getTotalPointsRedeemed } from "@/lib/pointsLedger";

// ─── أنواع البيانات ───────────────────────────────────────
export interface ExecutiveSummary {
  totalUsers: number;
  activeUsers: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  conversionRate: number;
  totalInvoiceValue: number;
  totalCommissionDue: number;
  averageInvoiceValue: number;
  totalPointsGranted: number;
  totalPointsRedeemed: number;
  pointsCost: number;
  totalVendors: number;
  activeVendors: number;
  topCategory: string;
}

export interface UseExecutiveDashboardReturn {
  summary: ExecutiveSummary | null;
  loading: boolean;
  error: string | null;
}

const defaultSummary: ExecutiveSummary = {
  totalUsers: 0,
  activeUsers: 0,
  totalBookings: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  conversionRate: 0,
  totalInvoiceValue: 0,
  totalCommissionDue: 0,
  averageInvoiceValue: 0,
  totalPointsGranted: 0,
  totalPointsRedeemed: 0,
  pointsCost: 0,
  totalVendors: 0,
  activeVendors: 0,
  topCategory: "—",
};

export function useExecutiveDashboard(
  startDate: Date,
  endDate: Date
): UseExecutiveDashboardReturn {
  const [summary, setSummary] = useState <ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;
    load();
  }, [startDate.toISOString(), endDate.toISOString()]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const start = Timestamp.fromDate(startDate);
      const end = Timestamp.fromDate(endDate);

      // ─── المستخدمون ──────────────────────────────────
      const usersSnap = await getDocs(collection(db, "users"));
      const totalUsers = usersSnap.size;
      const activeUsers = usersSnap.docs.filter(
        (d) => d.data().role === "user"
      ).length;

      // ─── الموردون ────────────────────────────────────
      const vendorsSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "vendor"))
      );
      const totalVendors = vendorsSnap.size;
      const activeVendors = vendorsSnap.docs.filter(
        (d) => d.data().isActive === true
      ).length;

      // ─── الفئات — جلب الأسماء ────────────────────────
      const categoriesSnap = await getDocs(collection(db, "categories"));
      const categoryMap: Record <string, string> = {};
      categoriesSnap.docs.forEach((d) => {
        categoryMap[d.id] = d.data().name ?? d.id;
      });

      // ─── الحجوزات في الفترة ──────────────────────────
      const bookingsSnap = await getDocs(
        query(
          collection(db, "bookings"),
          where("createdAt", ">=", start),
          where("createdAt", "<=", end),
          orderBy("createdAt", "desc")
        )
      );

      const bookings = bookingsSnap.docs.map((d) => d.data());
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter((b) => b.status === "completed").length;
      const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
      const conversionRate = totalBookings > 0
        ? Math.round((completedBookings / totalBookings) * 100)
        : 0;

      // ─── القيم المالية ───────────────────────────────
      const completedWithValue = bookings.filter(
        (b) => b.status === "completed" && b.orderValue
      );
      const totalInvoiceValue = completedWithValue.reduce(
        (sum, b) => sum + (b.orderValue ?? 0), 0
      );
      const averageInvoiceValue = completedWithValue.length > 0
        ? Math.round(totalInvoiceValue / completedWithValue.length)
        : 0;

      // ─── العمولات ────────────────────────────────────
      const totalCommissionDue = await getTotalCommissionDue(startDate, endDate);

      // ─── النقاط ──────────────────────────────────────
      const totalPointsGranted = await getTotalPointsGranted(startDate, endDate);
      const totalPointsRedeemed = await getTotalPointsRedeemed(startDate, endDate);
      const pointsCost = totalPointsRedeemed * 0.5;

      // ─── أكثر فئة — باستخدام الاسم ──────────────────
      const categoryCount: Record <string, number> = {};
      bookings.forEach((b) => {
        if (b.dealCategory) {
          const catName = categoryMap[b.dealCategory] ?? b.dealCategory;
          categoryCount[catName] = (categoryCount[catName] ?? 0) + 1;
        }
      });
      const topCategory = Object.entries(categoryCount).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ?? "—";

      setSummary({
        totalUsers,
        activeUsers,
        totalBookings,
        completedBookings,
        cancelledBookings,
        conversionRate,
        totalInvoiceValue,
        totalCommissionDue,
        averageInvoiceValue,
        totalPointsGranted,
        totalPointsRedeemed,
        pointsCost,
        totalVendors,
        activeVendors,
        topCategory,
      });
    } catch (err) {
      console.error("Executive dashboard error:", err);
      setError("تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error };
}