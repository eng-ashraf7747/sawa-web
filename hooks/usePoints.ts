// C:\sawa-web\hooks\usePoints.ts

"use client";
import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserPointsLedgerEntry, POINTS_LEDGER_SUBCOLLECTION } from "@/types/analytics";

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
  const [entries, setEntries] = useState<UserPointsLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    // قراءة مباشرة من دفتر نقاط المستخدم — نفس المسار اللي الدوال السحابية
    // (onUserRegistered.ts, onFirstLogin.ts) بتكتب فيه فعليًا: users/{uid}/pointsLedger
    const ledgerRef = collection(db, "users", uid, POINTS_LEDGER_SUBCOLLECTION);
    const q = query(ledgerRef, orderBy("timestamp", "desc"), limit(500));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedEntries = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as UserPointsLedgerEntry));
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

  const summary = useMemo(() => {
    const newSummary: PointsSummary = { ...defaultSummary };

    entries.forEach((entry) => {
      switch (entry.type) {
        case "signup_bonus":
          newSummary.signupBonus += entry.points;
          break;
        case "referral_owner_bonus":
          newSummary.referralOwner += entry.points;
          break;
        case "referral_joiner_bonus":
          newSummary.referralJoiner += entry.points;
          break;
        case "admin_adjustment":
          // ملاحظة: لا توجد أي بيانات حقيقية من هذا النوع حاليًا لاختبارها،
          // ولا يوجد بعد تصميم واجهة لعرض تعديل سالب — القيمة تُجمع كما هي
          newSummary.adminGrant += entry.points;
          break;
      }
    });

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