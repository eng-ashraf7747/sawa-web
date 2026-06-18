"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, reload } from "firebase/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/"); return; }
      setEmail(user.email ?? "");

      // فحص كل ثانيتين
      const interval = setInterval(async () => {
        try {
          await reload(user);
          const refreshed = auth.currentUser;
          if (refreshed?.emailVerified) {
            clearInterval(interval);
            // تحديث Firestore
            await updateDoc(doc(db, "users", refreshed.uid), {
              emailVerified: true,
              updatedAt: serverTimestamp(),
            });
            router.push("/dashboard");
          }
        } catch (_) {}
      }, 2000);

      setChecking(false);
      return () => clearInterval(interval);
    });

    return () => unsubscribe();
  }, [router]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const { sendEmailVerification } = await import("firebase/auth");
        await sendEmailVerification(user);
        // Cooldown 60 ثانية
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (_) {}
    finally { setResending(false); }
  };

  const handleLogout = async () => {
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    router.push("/");
  };

  if (checking) return null;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#f0f4f8] flex items-center justify-center text-4xl mx-auto mb-6"
          style={{ border: "2px solid #c9a84c" }}>
          📧
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-[#0d2447] mb-2">
          تحقق من بريدك الإلكتروني
        </h2>

        {/* Email */}
        <p className="text-sm text-[#6b7280] mb-1">تم إرسال رابط التحقق إلى:</p>
        <p className="text-sm font-bold text-[#1a3c6e] mb-4">{email}</p>

        <p className="text-xs text-[#6b7280] mb-6">
          افتح بريدك الإلكتروني واضغط على الرابط للتحقق من حسابك.
        </p>

        {/* Waiting Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-4 h-4 border-2 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          <span className="text-sm text-[#6b7280]">في انتظار التحقق...</span>
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="w-full py-3 border-2 border-[#1a3c6e] text-[#1a3c6e] rounded-xl font-bold text-sm hover:bg-[#1a3c6e] hover:text-white transition-all cursor-pointer disabled:opacity-50 mb-3"
        >
          {resending ? "جاري الإرسال..." : resendCooldown > 0 ? `إعادة الإرسال (${resendCooldown}s)` : "إعادة إرسال رابط التحقق"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 text-[#6b7280] text-sm hover:text-[#1a3c6e] transition-colors cursor-pointer"
        >
          تسجيل الخروج والعودة للدخول
        </button>
      </div>
    </div>
  );
}