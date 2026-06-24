// C:\sawa-web\app\vendor\page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVendorGuard } from "@/hooks/useVendorGuard";

export default function VendorPage() {
  const { isAuthorized, loading } = useVendorGuard();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthorized) {
      router.replace("/vendor/overview");
    }
  }, [isAuthorized, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  );
}