// lib/authErrors.ts

// ─── Firebase Auth Error Codes → Arabic Messages ──────────────
export const mapAuthError = (code: string): string => {
  switch (code) {
    case "auth/user-not-found":
      return "الحساب غير موجود";
    case "auth/wrong-password":
      return "كلمة المرور غلط";
    case "auth/invalid-credential":
      return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    case "auth/invalid-email":
      return "البريد الإلكتروني غير صالح";
    case "auth/too-many-requests":
      return "تم تجاوز عدد المحاولات — حاول بعد قليل";
    case "auth/user-disabled":
      return "هذا الحساب موقوف — تواصل مع الدعم";
    case "auth/email-already-in-use":
      return "البريد الإلكتروني مستخدم بالفعل";
    case "auth/weak-password":
      return "كلمة المرور ضعيفة — 8 أحرف على الأقل";
    case "auth/popup-closed-by-user":
      return "تم إغلاق نافذة تسجيل الدخول";
    case "auth/popup-blocked":
      return "تم حجب النافذة — يرجى السماح بالنوافذ المنبثقة";
    case "auth/cancelled-popup-request":
      return "تم إلغاء طلب تسجيل الدخول";
    case "auth/network-request-failed":
      return "خطأ في الاتصال — تحقق من الإنترنت";
    default:
      return "حصل خطأ غير متوقع — حاول تاني";
  }
};

// ─── Field-specific error keys ────────────────────────────────
export const getFieldError = (
  code: string
): { field: string; message: string } => {
  switch (code) {
    case "auth/email-already-in-use":
      return { field: "email", message: "البريد الإلكتروني مستخدم بالفعل" };
    case "auth/invalid-email":
      return { field: "email", message: "البريد الإلكتروني غير صالح" };
    case "auth/weak-password":
      return { field: "password", message: "كلمة المرور ضعيفة — 8 أحرف على الأقل" };
    default:
      return { field: "general", message: mapAuthError(code) };
  }
};