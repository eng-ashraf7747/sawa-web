"use client";
import { useState } from "react";
import { registerWithEmail, loginWithGoogle } from "@/lib/auth";

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

// ─── Validation ───────────────────────────────────────────────
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidEgyptianPhone = (phone: string): boolean =>
  /^(010|011|012|015)\d{8}$/.test(phone.trim());

const isValidPassword = (password: string): boolean =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

const isValidReferralCode = (code: string): boolean =>
  code.length === 6;

// ─── Password Strength ────────────────────────────────────────
type PasswordStrength = "empty" | "weak" | "medium" | "strong";

const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return "empty";
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
};

const strengthConfig = {
  empty: { label: "", color: "", width: "0%" },
  weak: { label: "ضعيفة", color: "#e53935", width: "33%" },
  medium: { label: "متوسطة", color: "#f57c00", width: "66%" },
  strong: { label: "قوية", color: "#43a047", width: "100%" },
};

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Field-level validation ──────────────────────────────────
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "displayName":
        if (!value.trim()) return "الاسم مطلوب";
        if (value.trim().length < 3) return "الاسم يجب أن يكون 3 أحرف على الأقل";
        return "";
      case "phone":
        if (!value.trim()) return "رقم الهاتف مطلوب";
        if (!isValidEgyptianPhone(value)) return "رقم هاتف مصري غير صالح";
        return "";
      case "email":
        if (!value.trim()) return "البريد الإلكتروني مطلوب";
        if (!isValidEmail(value)) return "بريد إلكتروني غير صالح";
        return "";
      case "password":
        if (!isValidPassword(value)) return "كلمة المرور: 8 أحرف على الأقل، حروف كبيرة وصغيرة وأرقام";
        return "";
      case "confirmPassword":
        if (value !== password) return "كلمات المرور غير متطابقة";
        return "";
      case "referralCode":
        if (value && !isValidReferralCode(value)) return "كود الإحالة يجب أن يكون 6 أحرف";
        return "";
      default:
        return "";
    }
  };

  const handleBlur = (name: string, value: string) => {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {
      displayName: validateField("displayName", displayName),
      phone: validateField("phone", phone),
      email: validateField("email", email),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
      referralCode: validateField("referralCode", referralCode),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(e => e !== "")) return;

    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName, phone, referralCode || undefined);
      window.location.href = "/verify-email";
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code === "auth/email-already-in-use") {
        setErrors(prev => ({ ...prev, email: "البريد الإلكتروني مستخدم بالفعل" }));
      } else if (e.code === "auth/weak-password") {
        setErrors(prev => ({ ...prev, password: "كلمة المرور ضعيفة — 8 أحرف على الأقل" }));
      } else if (e.code === "auth/invalid-email") {
        setErrors(prev => ({ ...prev, email: "البريد الإلكتروني غير صالح" }));
      
      } else {
        setErrors(prev => ({ ...prev, general: "حصل خطأ — حاول تاني" }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setErrors({});
    try {
      await loginWithGoogle();
      window.location.href = "/dashboard";
    } catch {
      setErrors({ general: "حصل خطأ في تسجيل الدخول بـ Google" });
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