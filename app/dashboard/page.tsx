// C:\sawa-web\app\dashboard\page.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DashboardPage() {
  const { userData, loading, isAuthenticated } = useUser();
  const router = useRouter();
  const [showReloadHint, setShowReloadHint] = useState(false);

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

  // شبكة أمان (16 يوليو 2026): لو ظل التحميل معلَّقاً أكثر من المعتاد لأي
  // سبب (هذه المشكلة أو غيرها مستقبلاً)، نعرض بعد 6 ثوانٍ خيار إعادة تحميل
  // يدوي بدل تعليق صامت لا يعرف المستخدم منه مخرجاً. لا يؤثر على المسار
  // الناجح إطلاقاً — يُلغى المؤقّت فور اكتمال تحميل البيانات بنجاح.
  useEffect(() => {
    if (!loading && userData) return;
    const timer = setTimeout(() => setShowReloadHint(true), 6000);
    return () => clearTimeout(timer);
  }, [loading, userData]);

  if (loading || !userData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4f8] gap-4">
      <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      {showReloadHint && (
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[#1a3c6e] font-semibold underline cursor-pointer"
        >
          الصفحة بتاخد وقت أطول من المعتاد — اضغط هنا لإعادة التحميل
        </button>
      )}
    </div>
  );

  if (!isAuthenticated || !userData.emailVerified) return null;
  if (userData.role === "admin") return null;
  if (userData.role === "vendor") return null;

  return <DashboardLayout />;
}