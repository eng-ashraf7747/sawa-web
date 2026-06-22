// C:\sawa-web\hooks\useCategories.ts

"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types/category";

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

// ─── Admin: كل الفئات ─────────────────────────────────────
export const useAllCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "categories"),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب الفئات:", err);
        setError("حدث خطأ في جلب الفئات");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { categories, loading, error };
};

// ─── User: الفئات النشطة فقط ─────────────────────────────
export const useActiveCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "categories"),
      where("isActive", "==", true),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب الفئات النشطة:", err);
        setError("حدث خطأ في جلب الفئات");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { categories, loading, error };
};