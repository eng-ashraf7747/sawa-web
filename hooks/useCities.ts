// C:\sawa-web\hooks\useCities.ts

"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { City } from "@/types";

interface UseCitiesReturn {
  cities: City[];
  loading: boolean;
  error: string | null;
}

// ─── قراءة كل المحافظات لحظياً من قاعدة البيانات ─────────────────
// ملاحظة معمارية (17 يوليو 2026): يحل هذا الهوك محل المصفوفة الثابتة
// CITIES التي كانت مكتوبة داخل constants/index.ts. الشكل المُرجَّع
// (City[]) مطابق تماماً للسابق، فلا حاجة لتغيير أي منطق في المكوّنات
// المستهلكة (ProfileSection.tsx, ContactForm.tsx, useCity.ts) — فقط
// مصدر البيانات هو الذي تغيّر، من ثابت في الكود إلى قراءة حية من
// مجموعة "cities" في Firestore، بنفس نمط useCategories.ts تماماً.
export const useCities = (): UseCitiesReturn => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "cities"),
      (snapshot) => {
        setCities(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as City))
        );
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب المحافظات:", err);
        setError("حدث خطأ في جلب المحافظات");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { cities, loading, error };
};