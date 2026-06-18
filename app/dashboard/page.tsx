"use client";
import { useUser } from "@/hooks/useUser";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardPage() {
  const { loading } = useUser();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
    </div>
  );

  return <DashboardLayout />;
}