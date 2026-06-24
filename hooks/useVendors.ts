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

export const useVendors = (): UseVendorsReturn => {
  const [vendors, setVendors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return { vendors, loading, error };
};