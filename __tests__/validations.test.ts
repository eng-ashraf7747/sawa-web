// __tests__/validations.test.ts

import {
  isValidEmail,
  isValidEgyptianPhone,
  isValidPassword,
  isValidReferralCode,
  getPasswordStrength,
  validateRegisterField,
  isValidTermsAccepted,
} from "@/lib/validations";

// ─── isValidEmail ─────────────────────────────────────────────
describe("isValidEmail", () => {
  it("يقبل إيميل صحيح", () => {
    expect(isValidEmail("test@gmail.com")).toBe(true);
    expect(isValidEmail("user.name@domain.co")).toBe(true);
  });

  it("يرفض إيميل غلط", () => {
    expect(isValidEmail("testgmail.com")).toBe(false);
    expect(isValidEmail("test@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

// ─── isValidEgyptianPhone ─────────────────────────────────────
describe("isValidEgyptianPhone", () => {
  it("يقبل رقم مصري صحيح", () => {
    expect(isValidEgyptianPhone("01012345678")).toBe(true);
    expect(isValidEgyptianPhone("01112345678")).toBe(true);
    expect(isValidEgyptianPhone("01212345678")).toBe(true);
    expect(isValidEgyptianPhone("01512345678")).toBe(true);
  });

  it("يرفض رقم غير مصري", () => {
    expect(isValidEgyptianPhone("0201012345678")).toBe(false);
    expect(isValidEgyptianPhone("1234567890")).toBe(false);
    expect(isValidEgyptianPhone("0109999")).toBe(false);
    expect(isValidEgyptianPhone("")).toBe(false);
  });
});

// ─── isValidPassword ──────────────────────────────────────────
describe("isValidPassword", () => {
  it("يقبل باسورد قوي", () => {
    expect(isValidPassword("Abc12345")).toBe(true);
    expect(isValidPassword("StrongP@ss1")).toBe(true);
  });

  it("يرفض باسورد ضعيف", () => {
    expect(isValidPassword("abc123")).toBe(false);
    expect(isValidPassword("ABCDEFGH")).toBe(false);
    expect(isValidPassword("abcdefgh")).toBe(false);
    expect(isValidPassword("12345678")).toBe(false);
    expect(isValidPassword("")).toBe(false);
  });
});

// ─── isValidReferralCode ──────────────────────────────────────
describe("isValidReferralCode", () => {
  it("يقبل كود 6 أحرف", () => {
    expect(isValidReferralCode("ABC123")).toBe(true);
    expect(isValidReferralCode("XYZABC")).toBe(true);
  });

  it("يرفض كود أقل أو أكثر من 6 أحرف", () => {
    expect(isValidReferralCode("ABC12")).toBe(false);
    expect(isValidReferralCode("ABC1234")).toBe(false);
    expect(isValidReferralCode("")).toBe(false);
  });
});

// ─── getPasswordStrength ──────────────────────────────────────
describe("getPasswordStrength", () => {
  it("يرجع empty لو الباسورد فاضي", () => {
    expect(getPasswordStrength("")).toBe("empty");
  });

  it("يرجع weak لو الباسورد ضعيف", () => {
    expect(getPasswordStrength("abc")).toBe("weak");
  });

  it("يرجع medium لو الباسورد متوسط", () => {
    expect(getPasswordStrength("Abcd123")).toBe("medium");
  });

  it("يرجع strong لو الباسورد قوي", () => {
    expect(getPasswordStrength("Abcd1234@")).toBe("strong");
  });
});

// ─── validateRegisterField ────────────────────────────────────
describe("validateRegisterField", () => {
  it("يرفض الاسم الفاضي", () => {
    expect(validateRegisterField("displayName", "")).toBe("الاسم مطلوب");
  });

  it("يرفض الاسم الأقل من 3 أحرف", () => {
    expect(validateRegisterField("displayName", "أش")).toBe("الاسم يجب أن يكون 3 أحرف على الأقل");
  });

  it("يقبل اسم صحيح", () => {
    expect(validateRegisterField("displayName", "أشرف")).toBe("");
  });

  it("يرفض رقم هاتف غلط", () => {
    expect(validateRegisterField("phone", "123")).toBe("رقم هاتف مصري غير صالح");
  });

  it("يرفض إيميل غلط", () => {
    expect(validateRegisterField("email", "test")).toBe("بريد إلكتروني غير صالح");
  });

  it("يرفض باسورد ضعيف", () => {
    expect(validateRegisterField("password", "abc")).toBe("كلمة المرور: 8 أحرف على الأقل، حروف كبيرة وصغيرة وأرقام");
  });

  it("يرفض تأكيد باسورد مختلف", () => {
    expect(validateRegisterField("confirmPassword", "different", "Abc12345")).toBe("كلمات المرور غير متطابقة");
  });
});
  // ─── Terms Accepted ─────────────────────────────────────
  describe("isValidTermsAccepted", () => {
    it("يرجع true لقيمة true", () => {
      expect(isValidTermsAccepted(true)).toBe(true);
    });

    it("يرجع true لقيمة 'true' كنص", () => {
      expect(isValidTermsAccepted("true")).toBe(true);
    });

    it("يرجع false لقيمة false", () => {
      expect(isValidTermsAccepted(false)).toBe(false);
    });

    it("يرجع false لقيمة 'false' كنص", () => {
      expect(isValidTermsAccepted("false")).toBe(false);
    });

    it("يرجع false لقيمة فارغة", () => {
      expect(isValidTermsAccepted("")).toBe(false);
    });
  });

  describe("validateRegisterField - termsAccepted", () => {
    it("يرجع خطأ عند false", () => {
      expect(validateRegisterField("termsAccepted", false)).toBe("يجب الموافقة على شروط الاستخدام");
    });

    it("يرجع خطأ عند string فارغ", () => {
      expect(validateRegisterField("termsAccepted", "")).toBe("يجب الموافقة على شروط الاستخدام");
    });

    it("يرجع فارغ عند true", () => {
      expect(validateRegisterField("termsAccepted", true)).toBe("");
    });

    it("يرجع فارغ عند 'true' كنص", () => {
      expect(validateRegisterField("termsAccepted", "true")).toBe("");
    });
  });