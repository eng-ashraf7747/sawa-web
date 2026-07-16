// C:\sawa-web\components\auth\RegisterForm.tsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail, loginWithGoogle } from "@/lib/auth";
import { getFieldError, mapAuthError } from "@/lib/authErrors";
import {
  validateRegisterField,
  getPasswordStrength,
  strengthConfig,
} from "@/lib/validations";

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBlur = (name: string, value: string) => {
    const error = validateRegisterField(name, value, password);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {
      displayName: validateRegisterField("displayName", displayName),
      phone: validateRegisterField("phone", phone),
      email: validateRegisterField("email", email),
      password: validateRegisterField("password", password),
      confirmPassword: validateRegisterField("confirmPassword", confirmPassword, password),
      referralCode: validateRegisterField("referralCode", referralCode),
      termsAccepted: validateRegisterField("termsAccepted", termsAccepted),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(e => e !== "")) return;

    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName, phone, referralCode || undefined);
      // ملاحظة معمارية (16 يوليو 2026): تمت إزالة router.refresh() الزائدة —
      // نفس السبب الموثَّق في LoginForm.tsx (سباق توقيت مع router.push).
      router.push("/verify-email");

    } catch (err: unknown) {
      const e = err as { code?: string };
      const { field, message } = getFieldError(e.code ?? "");
      setErrors(prev => ({ ...prev, [field]: message }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setErrors({});
    try {
      await loginWithGoogle();
      // ملاحظة معمارية (16 يوليو 2026): نفس إزالة router.refresh() أعلاه.
      router.push("/dashboard");

    } catch (err: unknown) {
      const e = err as { code?: string };
      setErrors({ general: mapAuthError(e.code ?? "") });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);
  const strengthData = strengthConfig[strength];

  return (
    <div>
      <h2 className="text-xl font-extrabold text-[#0d2447] text-center mb-1">إنشاء حساب جديد</h2>
      <p className="text-xs text-[#6b7280] text-center mb-4">سجل وانضم لآلاف الأعضاء</p>

      {/* Google */}
      <button onClick={handleGoogle} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#e8eaed] rounded-xl text-sm font-semibold hover:border-[#1a3c6e] hover:bg-[#f8f9fb] transition-all cursor-pointer mb-4 disabled:opacity-50">
        🇬 الدخول بجوجل
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#e8eaed]" />
        <span className="text-xs text-[#6b7280]">أو بالإيميل</span>
        <div className="flex-1 h-px bg-[#e8eaed]" />
      </div>

      {/* الاسم */}
      <div className="mb-3">
        <input type="text" placeholder="الاسم الكامل" value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          onBlur={e => handleBlur("displayName", e.target.value)}
          dir="rtl"
          className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.displayName ? "border-red-400" : "border-[#e8eaed] focus:border-[#1a3c6e]"}`} />
        {errors.displayName && <p className="text-red-500 text-xs mt-1 text-right">{errors.displayName}</p>}
      </div>

      {/* الهاتف */}
      <div className="mb-3">
        <input type="tel" placeholder="رقم الهاتف (01xxxxxxxxx)" value={phone}
          onChange={e => setPhone(e.target.value)}
          onBlur={e => handleBlur("phone", e.target.value)}
          dir="rtl"
          className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.phone ? "border-red-400" : "border-[#e8eaed] focus:border-[#1a3c6e]"}`} />
        {errors.phone && <p className="text-red-500 text-xs mt-1 text-right">{errors.phone}</p>}
      </div>

      {/* الإيميل */}
      <div className="mb-3">
        <input type="email" placeholder="البريد الإلكتروني" value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={e => handleBlur("email", e.target.value)}
          dir="rtl"
          className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.email ? "border-red-400" : "border-[#e8eaed] focus:border-[#1a3c6e]"}`} />
        {errors.email && <p className="text-red-500 text-xs mt-1 text-right">{errors.email}</p>}
      </div>

      {/* كلمة المرور */}
      <div className="mb-1">
        <input type="password" placeholder="كلمة المرور" value={password}
          onChange={e => setPassword(e.target.value)}
          onBlur={e => handleBlur("password", e.target.value)}
          dir="rtl"
          className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.password ? "border-red-400" : "border-[#e8eaed] focus:border-[#1a3c6e]"}`} />
        {errors.password && <p className="text-red-500 text-xs mt-1 text-right">{errors.password}</p>}
      </div>

      {/* Password Strength */}
      {strength !== "empty" && (
        <div className="mb-3">
          <div className="w-full h-1 bg-[#e8eaed] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: strengthData.width, backgroundColor: strengthData.color }} />
          </div>
          <p className="text-xs mt-1 text-right" style={{ color: strengthData.color }}>
            قوة كلمة المرور: {strengthData.label}
          </p>
        </div>
      )}

      {/* تأكيد كلمة المرور */}
      <div className="mb-3">
        <input type="password" placeholder="تأكيد كلمة المرور" value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          onBlur={e => handleBlur("confirmPassword", e.target.value)}
          dir="rtl"
          className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.confirmPassword ? "border-red-400" : "border-[#e8eaed] focus:border-[#1a3c6e]"}`} />
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 text-right">{errors.confirmPassword}</p>}
      </div>

      {/* كود الإحالة */}
      <div className="mb-4">
        <input type="text" placeholder="كود الإحالة (اختياري)" value={referralCode}
          onChange={e => setReferralCode(e.target.value.toUpperCase())}
          onBlur={e => handleBlur("referralCode", e.target.value)}
          dir="rtl" maxLength={6}
          className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.referralCode ? "border-red-400" : "border-[#e8eaed] focus:border-[#1a3c6e]"}`} />
        {errors.referralCode && <p className="text-red-500 text-xs mt-1 text-right">{errors.referralCode}</p>}
      </div>

      {errors.general && <p className="text-red-500 text-xs text-center mb-3">{errors.general}</p>}

      {/* شروط الاستخدام */}
      <div className="mb-4 flex items-start gap-2.5">
        <input
          type="checkbox"
          id="terms-register"
          checked={termsAccepted}
          onChange={(e) => {
            setTermsAccepted(e.target.checked);
            if (e.target.checked) {
              setErrors(prev => ({ ...prev, termsAccepted: "" }));
            }
          }}
          className="mt-1 w-4 h-4 accent-[#1a3c6e] cursor-pointer flex-shrink-0"
        />
        <label htmlFor="terms-register" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
          أوافق على{" "}
          <a
            href="/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1a3c6e] font-semibold hover:underline"
          >
            شروط الاستخدام
          </a>
        </label>
      </div>
      {errors.termsAccepted && <p className="text-red-500 text-xs mb-3 text-right -mt-2">{errors.termsAccepted}</p>}

      <button onClick={handleRegister} disabled={loading || !termsAccepted}
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