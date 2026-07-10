// C:\sawa-web\__tests__\profileValidation.test.ts

import { validateProfileInput, validateProfileImage, MAX_PROFILE_IMAGE_SIZE_BYTES } from "@/lib/profileValidation";

describe("validateProfileInput", () => {
  const baseInput = {
    displayName: "أحمد علي",
    phone: "01012345678",
    city: "fayoum",
  };

  it("يرجع رسالة خطأ لو الاسم فاضي", () => {
    expect(validateProfileInput({ ...baseInput, displayName: "" })).toBe("الاسم مطلوب");
  });

  it("يرجع رسالة خطأ لو رقم الهاتف غير صالح", () => {
    expect(validateProfileInput({ ...baseInput, phone: "123" })).toBe("رقم الهاتف غير صالح");
  });

  it("يرجع رسالة خطأ لو المدينة فاضية", () => {
    expect(validateProfileInput({ ...baseInput, city: "" })).toBe("المدينة مطلوبة");
  });

  it("يرجع رسالة خطأ لو السن خارج النطاق المسموح", () => {
    expect(validateProfileInput({ ...baseInput, age: 5 })).toContain("السن يجب أن يكون بين");
    expect(validateProfileInput({ ...baseInput, age: 150 })).toContain("السن يجب أن يكون بين");
  });

  it("يرجع سلسلة فاضية لو كل البيانات صحيحة (بدون سن)", () => {
    expect(validateProfileInput(baseInput)).toBe("");
  });

  it("يرجع سلسلة فاضية لو كل البيانات صحيحة (مع سن ضمن النطاق)", () => {
    expect(validateProfileInput({ ...baseInput, age: 30 })).toBe("");
  });
});

describe("validateProfileImage", () => {
  const makeFile = (type: string, sizeBytes: number): File => {
    const blob = new Blob(["x".repeat(sizeBytes)], { type });
    return new File([blob], "photo.jpg", { type });
  };

  it("يرجع رسالة خطأ لصيغة غير مدعومة", () => {
    const file = makeFile("image/gif", 1000);
    expect(validateProfileImage(file)).toBe("صيغة الصورة غير مدعومة (jpg, png, webp فقط)");
  });

  it("يرجع رسالة خطأ لو الحجم أكبر من المسموح", () => {
    const file = makeFile("image/jpeg", MAX_PROFILE_IMAGE_SIZE_BYTES + 1);
    expect(validateProfileImage(file)).toBe("حجم الصورة أكبر من 2 ميجابايت");
  });

  it("يرجع سلسلة فاضية لصورة صالحة", () => {
    const file = makeFile("image/png", 1000);
    expect(validateProfileImage(file)).toBe("");
  });
});