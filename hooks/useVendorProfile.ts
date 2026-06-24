// C:\sawa-web\hooks\useVendorProfile.ts

"use client";

import { useState, useEffect } from "react";
import { VendorProfile } from "@/types/vendorProfile";
import { streamVendorProfile } from "@/lib/vendorProfile";

interface UseVendorProfileReturn {
  profile: VendorProfile | null;
  loading: boolean;
  error: string | null;
}

export const useVendorProfile = (vendorId: string): UseVendorProfileReturn => {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    const unsubscribe = streamVendorProfile(
      vendorId,
      (data) => {
        setProfile(data);
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب بيانات المورد:", err);
        setError("حدث خطأ في جلب بيانات المورد");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vendorId]);

  return { profile, loading, error };
};