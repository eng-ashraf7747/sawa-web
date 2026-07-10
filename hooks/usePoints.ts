// C:\sawa-web\hooks\usePoints.ts
"use client";
import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PointsLedgerEntry, ANALYTICS_COLLECTIONS } from "@/types/analytics";

interface PointsSummary {
  signupBonus: number;
  referralOwner: number;
  referralJoiner: number;
  transaction: number;
  review: number;
  adminGrant: number;
  subscriptionPayment: number;
  expired: number;
  carryOver: number;
  total: number;
}

interface UsePointsReturn {
  summary: PointsSummary;
  loading: boolean;
  error: string | null;
}

const defaultSummary: PointsSummary = {
  signupBonus: 0,
  referralOwner: 0,
  referralJoiner: 0,
  transaction: 0,
  review: 0,
  adminGrant: 0,
  subscriptionPayment: 0,
  expired: 0,
  carryOver: 0,
  total: 0,
};

export const usePoints = (uid: string | undefined): UsePointsReturn => {
  const [entries, setEntries] = useState<PointsLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const ledgerRef = collection(db, ANALYTICS_COLLECTIONS.POINTS_LEDGER);
    const q = query(
      ledgerRef,
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(500) // حد معقول للأداء
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedEntries = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as PointsLedgerEntry));
        setEntries(loadedEntries);
        setLoading(false);
      },
      (err) => {
        console.error("Points ledger error:", err);
        setError("حدث خطأ في تحميل سجل النقاط");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  // حساب الـ Summary بطريقة أكثر شمولاً
  const summary = useMemo(() => {
    const newSummary: PointsSummary = { ...defaultSummary };

    entries.forEach((entry) => {
      const points = entry.points;

      if (entry.type === "earned") {
        switch (entry.source) {
          case "registration":
            newSummary.signupBonus += points;
            break;
          case "referral_sent":
            newSummary.referralOwner += points;
            break;
          case "referral_received":
            newSummary.referralJoiner += points;
            break;
          case "transaction_completed":
            newSummary.transaction += points;
            break;
          case "review_submitted":
            newSummary.review += points;
            break;
          case "admin_grant":
            newSummary.adminGrant += points;
            break;
        }
      } else if (entry.type === "redeemed") {
        if (entry.source === "subscription_redeemed") {
          newSummary.subscriptionPayment += Math.abs(points);
        }
      } else if (entry.type === "expired") {
        newSummary.expired += Math.abs(points);
      }
    });

    // Total calculation
    newSummary.total =
      newSummary.signupBonus +
      newSummary.referralOwner +
      newSummary.referralJoiner +
      newSummary.transaction +
      newSummary.review +
      newSummary.adminGrant +
      newSummary.carryOver -
      newSummary.subscriptionPayment -
      newSummary.expired;

    return newSummary;
  }, [entries]);

  return { summary, loading, error };
};