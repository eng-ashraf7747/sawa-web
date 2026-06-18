"use client";
import { useState } from "react";
import { forgotPassword } from "@/lib/auth";
import { mapAuthError } from "@/lib/authErrors";
import { isValidEmail } from "@/lib/validations";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { setError("البريد الإلكتروني مطلوب"); return; }
    if (!isValidEmail(email)) { setError("بريد إلكتروني غير صالح"); return; }
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const e = err as { code?: string };
      setError(mapAuthError(e.code ?? ""));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="text-xl font-extrabold text-[#0d2447] mb-2">تم الإرسال</h2>
        <p className="text-sm text-[#6b7280] mb-6">
          إذا كان البريد الإلكتروني مسجلاً لدينا، ستصلك رسالة إعادة تعيين كلمة المرور خلال دقائق.
        </p>
        <button onClick={onBack}
          className="w-full py-3 bg-[#1a3c6e] text-white rounded-xl font-bold text-sm hover:bg-[#0d2447] transition-colors cursor-pointer">
          العودة لتسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack}
        className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#1a3c6e] mb-4 cursor-pointer">
        ← العودة
      </button>
      <h2 className="text-xl font-extrabold text-[#0d2447] text-center mb-1">نسيت كلمة المرور؟</h2>
      <p className="text-xs text-[#6b7280] text-center mb-6">أدخل بريدك وسنرسل لك رابط إعادة التعيين</p>

      <input type="email" placeholder="البريد الإلكتروني" value={email}
        onChange={e => setEmail(e.target.value)} dir="rtl"
        className="w-full px-4 py-3 border-2 border-[#e8eaed] rounded-xl text-sm mb-4 focus:border-[#1a3c6e] outline-none transition-colors" />

      {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-3.5 bg-[#1a3c6e] text-white rounded-xl font-bold text-sm hover:bg-[#0d2447] transition-colors cursor-pointer disabled:opacity-50">
        {loading ? "جاري..." : "إرسال رابط إعادة التعيين"}
      </button>
    </div>
  );
}