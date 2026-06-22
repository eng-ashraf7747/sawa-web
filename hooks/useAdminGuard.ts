// C:\sawa-web\hooks\useAdminGuard.ts

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

interface UseAdminGuardReturn {
  isAuthorized: boolean;
  loading: boolean;
}

export const useAdminGuard = (): UseAdminGuardReturn => {
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

    if (userData?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, userData, router]);

  const isAuthorized =
    !loading &&
    isAuthenticated &&
    !!userData?.emailVerified &&
    userData?.role === "admin";

  return { isAuthorized, loading };
};