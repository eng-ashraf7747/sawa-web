// C:\sawa-web\app\dashboard\page.tsx

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardPage() {
  const { userData, loading, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    if (!userData) return;
    if (!userData.emailVerified) {
      router.push("/verify-email");
      return;
    }
    if (userData.role === "admin") {
      router.push("/admin/overview");
      return;
    }
    if (userData.role === "vendor") {
      router.push("/vendor/overview");
      return;
    }
  }, [loading, isAuthenticated, userData, router]);

  if (loading || !userData) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated || !userData.emailVerified) return null;
  if (userData.role === "admin") return null;
  if (userData.role === "vendor") return null;

  return <DashboardLayout />;
}