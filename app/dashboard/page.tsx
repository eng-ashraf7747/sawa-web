"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardPage() {
  const { isAuthenticated, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return null;
  if (!isAuthenticated) return null;

  return <DashboardLayout />;
}