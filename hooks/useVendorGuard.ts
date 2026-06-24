// C:\sawa-web\hooks\useVendorGuard.ts

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

interface UseVendorGuardReturn {
  isAuthorized: boolean;
  loading: boolean;
  vendorId: string | null;
}

export const useVendorGuard = (): UseVendorGuardReturn => {
  const { userData, loading, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    if (!userData?.emailVerified) {
      router.push("/verify-email");
      return;
    }

    if (userData?.role !== "vendor") {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, userData, router]);

  const isAuthorized =
    !loading &&
    isAuthenticated &&
    !!userData?.emailVerified &&
    userData?.role === "vendor";

  return {
    isAuthorized,
    loading,
    vendorId: isAuthorized ? userData?.uid ?? null : null,
  };
};