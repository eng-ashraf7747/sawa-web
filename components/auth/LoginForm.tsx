"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithGoogle } from "@/lib/auth";
import { mapAuthError } from "@/lib/authErrors";
import { isValidEmail } from "@/lib/validations";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) { setError("البريد الإلكتروني مطلوب"); return; }
    if (!isValidEmail(email)) { setError("بريد إلكتروني غير صالح"); return; }
    if (!password) { setError("كلمة المرور مطلوبة"); return; }
    setLoading(true);
    setError("");
    try {
      await loginWithEmail(email, password);
      window.location.href = "/dashboard";

    } catch (err: unknown) {
      const e = err as { code?: string };
      setError(mapAuthError(e.code ?? ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      window.location.href = "/dashboard";

    } catch (err: unknown) {
      const e = err as { code?: string };
      setError(mapAuthError(e.code ?? "auth/popup-closed-by-user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold text-[#0d2447] text-center mb-1">مرحباً بك في سوا</h2>
      <p className="text-xs text-[#6b7280] text-center mb-6">سجل دخولك للمتابعة</p>

      <button onClick={handleGoogle} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#e8eaed] rounded-xl text-sm font-semibold hover:border-[#1a3c6e] hover:bg-[#f8f9fb] transition-all cursor-pointer mb-4 disabled:opacity-50">
        🇬 الدخول بجوجل
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#e8eaed]" />
        <span className="text-xs text-[#6b7280]">أو بالإيميل</span>
        <div className="flex-1 h-px bg-[#e8eaed]" />
      </div>

      <input type="email" placeholder="البريد الإلكتروني" value={email}
        onChange={e => setEmail(e.target.value)} dir="rtl"
        className="w-full px-4 py-3 border-2 border-[#e8eaed] rounded-xl text-sm mb-3 focus:border-[#1a3c6e] outline-none transition-colors" />

      <input type="password" placeholder="كلمة المرور" value={password}
        onChange={e => setPassword(e.target.value)} dir="rtl"
        className="w-full px-4 py-3 border-2 border-[#e8eaed] rounded-xl text-sm mb-2 focus:border-[#1a3c6e] outline-none transition-colors" />

      <div className="text-left mb-4">
        <button onClick={onForgotPassword}
          className="text-xs text-[#1a3c6e] hover:underline cursor-pointer">
          نسيت كلمة المرور؟
        </button>
      </div>

      {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

      <button onClick={handleLogin} disabled={loading}
        className="w-full py-3.5 bg-[#1a3c6e] text-white rounded-xl font-bold text-sm hover:bg-[#0d2447] transition-colors cursor-pointer disabled:opacity-50">
        {loading ? "جاري..." : "تسجيل الدخول"}
      </button>

      <div className="text-center mt-4 text-xs text-[#6b7280]">
        مش عندك حساب؟{" "}
        <button onClick={onSwitchToRegister} className="text-[#1a3c6e] font-semibold hover:underline cursor-pointer">
          سجل دلوقتي
        </button>
      </div>
    </div>
  );
}