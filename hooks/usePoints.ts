// C:\sawa-web\hooks\usePoints.ts

"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PointsLedgerEntry } from "@/types";
import { ANALYTICS_COLLECTIONS } from "@/types/analytics";

interface PointsSummary {
  signupBonus: number;
  referralOwner: number;
  referralJoiner: number;
  subscriptionPayment: number;
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
  subscriptionPayment: 0,
  carryOver: 0,
  total: 0,
};

export const usePoints = (uid: string | undefined): UsePointsReturn => {
  const [summary, setSummary] = useState <PointsSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const ledgerRef = collection(db, ANALYTICS_COLLECTIONS.POINTS_LEDGER);
    const q = query(
      ledgerRef,
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        } as PointsLedgerEntry));

        const newSummary: PointsSummary = { ...defaultSummary };

        entries.forEach((entry) => {
          if (entry.points > 0) {
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
            }
          } else {
            switch (entry.type) {
              case "subscription_payment":
                newSummary.subscriptionPayment += Math.abs(entry.points);
                break;
            }
          }
        });

        newSummary.total =
          newSummary.signupBonus +
          newSummary.referralOwner +
          newSummary.referralJoiner +
          newSummary.carryOver -
          newSummary.subscriptionPayment;

        setSummary(newSummary);
        setLoading(false);
      },
      (err) => {
        console.error("Points ledger error:", err);
        setError("حدث خطأ في تحميل النقاط");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { summary, loading, error };
};