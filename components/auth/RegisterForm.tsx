"use client";
import { useState } from "react";
import { registerWithEmail, loginWithGoogle } from "@/lib/auth";

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      await registerWithEmail(email, password);
      onSuccess();
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "auth/email-already-in-use") setError("الإيميل ده موجود بالفعل");
      else if (e.code === "auth/weak-password") setError("كلمة المرور ضعيفة — 6 أحرف على الأقل");
      else setError("حصل خطأ — حاول تاني");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      onSuccess();
    } catch {
      setError("حصل خطأ في تسجيل الدخول بـ Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold text-[#0d2447] text-center mb-1">إنشاء حساب جديد</h2>
      <p className="text-xs text-[#6b7280] text-center mb-6">سجل وانضم لآلاف الأعضاء</p>

      <button onClick={handleGoogle} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#e8eaed] rounded-xl text-sm font-semibold hover:border-[#1a3c6e] hover:bg-[#f8f9fb] transition-all cursor-pointer mb-4 disabled:opacity-50">
        🇬 Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#e8eaed]"/>
        <span className="text-xs text-[#6b7280]">أو بالإيميل</span>
        <div className="flex-1 h-px bg-[#e8eaed]"/>
      </div>

      <input type="email" placeholder="البريد الإلكتروني" value={email}
        onChange={e => setEmail(e.target.value)} dir="rtl"
        className="w-full px-4 py-3 border-2 border-[#e8eaed] rounded-xl text-sm mb-3 focus:border-[#1a3c6e] outline-none transition-colors"/>
      <input type="password" placeholder="كلمة المرور (6 أحرف على الأقل)" value={password}
        onChange={e => setPassword(e.target.value)} dir="rtl"
        className="w-full px-4 py-3 border-2 border-[#e8eaed] rounded-xl text-sm mb-4 focus:border-[#1a3c6e] outline-none transition-colors"/>

      {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

      <button onClick={handleRegister} disabled={loading}
        className="w-full py-3.5 bg-[#1a3c6e] text-white rounded-xl font-bold text-sm hover:bg-[#0d2447] transition-colors cursor-pointer disabled:opacity-50">
        {loading ? "جاري..." : "إنشاء الحساب"}
      </button>

      <div className="text-center mt-4 text-xs text-[#6b7280]">
        عندك حساب؟{" "}
        <button onClick={onSwitchToLogin} className="text-[#1a3c6e] font-semibold hover:underline cursor-pointer">
          سجل دخول
        </button>
      </div>
    </div>
  );
}