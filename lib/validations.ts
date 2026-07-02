// C:\sawa-web\lib\validations.ts

// ─── Email ────────────────────────────────────────────────────
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ─── Egyptian Phone ───────────────────────────────────────────
export const isValidEgyptianPhone = (phone: string): boolean =>
  /^(010|011|012|015)\d{8}$/.test(phone.trim());

// ─── Password ─────────────────────────────────────────────────
export const isValidPassword = (password: string): boolean =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password);

// ─── Referral Code ────────────────────────────────────────────
export const isValidReferralCode = (code: string): boolean =>
  code.length === 6;

// ─── Password Strength ────────────────────────────────────────
export type PasswordStrength = "empty" | "weak" | "medium" | "strong";

export const getPasswordStrength = (password: string): PasswordStrength => {
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

export const strengthConfig = {
  empty: { label: "", color: "", width: "0%" },
  weak: { label: "ضعيفة", color: "#e53935", width: "33%" },
  medium: { label: "متوسطة", color: "#f57c00", width: "66%" },
  strong: { label: "قوية", color: "#43a047", width: "100%" },
};

// ─── Terms Accepted ───────────────────────────────────────────
export const isValidTermsAccepted = (value: string | boolean): boolean =>
  value === true || value === "true";

// ─── Register Form Validator ──────────────────────────────────
export const validateRegisterField = (
  name: string,
  value: string | boolean,
  password?: string
): string => {
  switch (name) {
    case "displayName":
      if (typeof value !== "string") return "";
      if (!value.trim()) return "الاسم مطلوب";
      if (value.trim().length < 3) return "الاسم يجب أن يكون 3 أحرف على الأقل";
      return "";
    case "phone":
      if (typeof value !== "string") return "";
      if (!value.trim()) return "رقم الهاتف مطلوب";
      if (!isValidEgyptianPhone(value)) return "رقم هاتف مصري غير صالح";
      return "";
    case "email":
      if (typeof value !== "string") return "";
      if (!value.trim()) return "البريد الإلكتروني مطلوب";
      if (!isValidEmail(value)) return "بريد إلكتروني غير صالح";
      return "";
    case "password":
      if (typeof value !== "string") return "";
      if (!isValidPassword(value))
        return "كلمة المرور: 8 أحرف على الأقل، حروف كبيرة وصغيرة وأرقام";
      return "";
    case "confirmPassword":
      if (typeof value !== "string") return "";
      if (value !== password) return "كلمات المرور غير متطابقة";
      return "";
    case "referralCode":
      if (typeof value !== "string") return "";
      if (value && !isValidReferralCode(value))
        return "كود الإحالة يجب أن يكون 6 أحرف";
      return "";
    case "termsAccepted":
      if (!isValidTermsAccepted(value)) return "يجب الموافقة على شروط الاستخدام";
      return "";
    default:
      return "";
  }
};