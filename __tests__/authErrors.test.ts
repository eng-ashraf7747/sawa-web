import { mapAuthError, getFieldError } from "@/lib/authErrors";

describe("mapAuthError", () => {
  it("يرجع رسالة صحيحة لـ user-not-found", () => {
    expect(mapAuthError("auth/user-not-found")).toBe("الحساب غير موجود");
  });
  it("يرجع رسالة صحيحة لـ wrong-password", () => {
    expect(mapAuthError("auth/wrong-password")).toBe("كلمة المرور غلط");
  });
  it("يرجع رسالة صحيحة لـ invalid-credential", () => {
    expect(mapAuthError("auth/invalid-credential")).toBe("البريد الإلكتروني أو كلمة المرور غير صحيحة");
  });
  it("يرجع رسالة صحيحة لـ email-already-in-use", () => {
    expect(mapAuthError("auth/email-already-in-use")).toBe("البريد الإلكتروني مستخدم بالفعل");
  });
  it("يرجع رسالة صحيحة لـ weak-password", () => {
    expect(mapAuthError("auth/weak-password")).toBe("كلمة المرور ضعيفة — 8 أحرف على الأقل");
  });
  it("يرجع رسالة صحيحة لـ network-request-failed", () => {
    expect(mapAuthError("auth/network-request-failed")).toBe("خطأ في الاتصال — تحقق من الإنترنت");
  });
  it("يرجع رسالة افتراضية لكود غير معروف", () => {
    expect(mapAuthError("auth/unknown")).toBe("حصل خطأ غير متوقع — حاول تاني");
  });
  it("يرجع رسالة افتراضية لو الكود فاضي", () => {
    expect(mapAuthError("")).toBe("حصل خطأ غير متوقع — حاول تاني");
  });
});

describe("getFieldError", () => {
  it("يرجع field email لـ email-already-in-use", () => {
    const result = getFieldError("auth/email-already-in-use");
    expect(result.field).toBe("email");
    expect(result.message).toBe("البريد الإلكتروني مستخدم بالفعل");
  });
  it("يرجع field email لـ invalid-email", () => {
    const result = getFieldError("auth/invalid-email");
    expect(result.field).toBe("email");
    expect(result.message).toBe("البريد الإلكتروني غير صالح");
  });
  it("يرجع field password لـ weak-password", () => {
    const result = getFieldError("auth/weak-password");
    expect(result.field).toBe("password");
    expect(result.message).toBe("كلمة المرور ضعيفة — 8 أحرف على الأقل");
  });
  it("يرجع field general لكود غير معروف", () => {
    const result = getFieldError("auth/unknown");
    expect(result.field).toBe("general");
  });
});