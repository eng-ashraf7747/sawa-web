// C:\sawa-web\hooks\useVendors.ts

"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";

interface UseVendorsReturn {
  vendors: User[];
  loading: boolean;
  error: string | null;
}

// ملاحظة معمارية (16 يوليو 2026): أُضيف بارامتر enabled (افتراضياً true) —
// يسمح لأي مستدعٍ (مثل DealForm.tsx) بتعطيل جلب قائمة كل الموردين تماماً
// عندما لا يكون محتاجها فعلياً (كحالة المورد نفسه)، بدل محاولة الجلب دائماً
// وفشلها بصلاحيات منشورة حديثاً. لا تغيير على السلوك الافتراضي (enabled=true).
export const useVendors = (enabled: boolean = true): UseVendorsReturn => {
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setVendors([]);
      setLoading(false);
      setError(null);
      return;
    }

    const q = query(
      collection(db, "users"),
      where("role", "==", "vendor"),
      orderBy("displayName", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setVendors(snapshot.docs.map((d) => ({ ...d.data() } as User)));
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب الموردين:", err);
        setError("حدث خطأ في جلب الموردين");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [enabled]);

  return { vendors, loading, error };
};