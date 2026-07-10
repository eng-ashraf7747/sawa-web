// C:\sawa-web\__tests__\profileValidation.test.ts

import {
  validateProfileInput,
  validateSourceImage,
  validateUploadImageSize,
  MAX_SOURCE_IMAGE_SIZE_BYTES,
  MAX_UPLOAD_IMAGE_SIZE_BYTES,
} from "@/lib/profileValidation";

describe("validateProfileInput", () => {
  const baseInput = {
    displayName: "أحمد علي",
    phone: "01012345678",
    city: "fayoum",
  };

  // ─── الاسم ───
  it("يرجع رسالة خطأ لو الاسم فاضي", () => {
    expect(validateProfileInput({ ...baseInput, displayName: "" })).toBe("الاسم مطلوب");
  });

  it("يرجع رسالة خطأ لو الاسم بمسافات فقط", () => {
    expect(validateProfileInput({ ...baseInput, displayName: "   " })).toBe("الاسم مطلوب");
  });

  it("يرجع رسالة خطأ لو الاسم أقصر من الحد الأدنى", () => {
    expect(validateProfileInput({ ...baseInput, displayName: "أ" })).toBe("الاسم يجب أن يكون بين 2 و50 حرف");
  });

  it("يرجع رسالة خطأ لو الاسم أطول من الحد الأقصى", () => {
    expect(validateProfileInput({ ...baseInput, displayName: "أ".repeat(51) })).toBe("الاسم يجب أن يكون بين 2 و50 حرف");
  });

  it("يقبل الاسم عند الحد الأقصى بالضبط (50 حرف)", () => {
    expect(validateProfileInput({ ...baseInput, displayName: "أ".repeat(50) })).toBe("");
  });

  // ─── رقم الهاتف ───
  it("يرجع رسالة خطأ لو رقم الهاتف فاضي", () => {
    expect(validateProfileInput({ ...baseInput, phone: "" })).toBe("رقم الهاتف مطلوب");
  });

  it("يرجع رسالة خطأ لو رقم الهاتف بمسافات فقط", () => {
    expect(validateProfileInput({ ...baseInput, phone: "   " })).toBe("رقم الهاتف مطلوب");
  });

  it("يرجع رسالة خطأ لو رقم الهاتف غير صالح", () => {
    expect(validateProfileInput({ ...baseInput, phone: "123" })).toBe("رقم الهاتف غير صالح");
  });

  // ─── المدينة ───
  it("يرجع رسالة خطأ لو المدينة فاضية", () => {
    expect(validateProfileInput({ ...baseInput, city: "" })).toBe("المدينة مطلوبة");
  });

  it("يرجع رسالة خطأ لو المدينة بمسافات فقط", () => {
    expect(validateProfileInput({ ...baseInput, city: "   " })).toBe("المدينة مطلوبة");
  });

  it("يرجع رسالة خطأ لو اسم المدينة أطول من الحد الأقصى", () => {
    expect(validateProfileInput({ ...baseInput, city: "a".repeat(51) })).toBe("اسم المدينة طويل جداً");
  });

  it("يقبل اسم المدينة عند الحد الأقصى بالضبط (50 حرف)", () => {
    expect(validateProfileInput({ ...baseInput, city: "a".repeat(50) })).toBe("");
  });

  // ─── العنوان (اختياري) ───
  it("يقبل عدم وجود عنوان خالص", () => {
    expect(validateProfileInput(baseInput)).toBe("");
  });

  it("يقبل عنوان بمسافات فقط (يُعامَل كغير موجود)", () => {
    expect(validateProfileInput({ ...baseInput, address: "   " })).toBe("");
  });

  it("يرجع رسالة خطأ لو العنوان أطول من الحد الأقصى", () => {
    expect(validateProfileInput({ ...baseInput, address: "a".repeat(201) })).toBe("العنوان طويل جداً");
  });

  it("يقبل العنوان عند الحد الأقصى بالضبط (200 حرف)", () => {
    expect(validateProfileInput({ ...baseInput, address: "a".repeat(200) })).toBe("");
  });

  // ─── السن (اختياري) ───
  it("يرجع رسالة خطأ لو السن أقل من الحد الأدنى", () => {
    expect(validateProfileInput({ ...baseInput, age: 5 })).toBe("السن يجب أن يكون بين 12 و 100");
  });

  it("يرجع رسالة خطأ لو السن أكبر من الحد الأقصى", () => {
    expect(validateProfileInput({ ...baseInput, age: 150 })).toBe("السن يجب أن يكون بين 12 و 100");
  });

  it("يرجع رسالة خطأ لو السن رقم عشري", () => {
    expect(validateProfileInput({ ...baseInput, age: 25.5 })).toBe("السن يجب أن يكون بين 12 و 100");
  });

  it("يرجع رسالة خطأ لو السن NaN", () => {
    expect(validateProfileInput({ ...baseInput, age: NaN })).toBe("السن يجب أن يكون بين 12 و 100");
  });

  it("يقبل السن عند حدوده القصوى بالضبط (12 و100)", () => {
    expect(validateProfileInput({ ...baseInput, age: 12 })).toBe("");
    expect(validateProfileInput({ ...baseInput, age: 100 })).toBe("");
  });

  it("يقبل سن ضمن النطاق المسموح", () => {
    expect(validateProfileInput({ ...baseInput, age: 30 })).toBe("");
  });

  // ─── النوع (اختياري) ───
  it("يرجع رسالة خطأ لقيمة نوع غير صالحة وقت التشغيل (تتجاوز فحص TypeScript)", () => {
    expect(
      validateProfileInput({ ...baseInput, gender: "other" as unknown as "male" | "female" })
    ).toBe("الجنس غير صالح");
  });

  it("يقبل النوعين الصالحين", () => {
    expect(validateProfileInput({ ...baseInput, gender: "male" })).toBe("");
    expect(validateProfileInput({ ...baseInput, gender: "female" })).toBe("");
  });
});

describe("validateSourceImage", () => {
  const makeFile = (type: string, sizeBytes: number): File => {
    const blob = new Blob([new Uint8Array(sizeBytes)], { type });
    return new File([blob], "photo.jpg", { type });
  };

  it("يرجع رسالة خطأ لصيغة غير مدعومة", () => {
    expect(validateSourceImage(makeFile("image/gif", 1000))).toBe("صيغة الصورة غير مدعومة (jpg, png, webp فقط)");
  });

  it("يرجع رسالة خطأ لو الملف الأصلي أكبر من الحد الأقصى", () => {
    expect(validateSourceImage(makeFile("image/jpeg", MAX_SOURCE_IMAGE_SIZE_BYTES + 1))).toBe("حجم الصورة أكبر من 8 ميجابايت");
  });

  it("يقبل ملف عند الحد الأقصى بالضبط", () => {
    expect(validateSourceImage(makeFile("image/jpeg", MAX_SOURCE_IMAGE_SIZE_BYTES))).toBe("");
  });

  it("يقبل صورة صالحة من كل الصيغ المدعومة", () => {
    expect(validateSourceImage(makeFile("image/jpeg", 1000))).toBe("");
    expect(validateSourceImage(makeFile("image/png", 1000))).toBe("");
    expect(validateSourceImage(makeFile("image/webp", 1000))).toBe("");
  });
});

describe("validateUploadImageSize", () => {
  const makeBlob = (sizeBytes: number): Blob => new Blob([new Uint8Array(sizeBytes)]);

  it("يرجع رسالة خطأ لو الحجم بعد التصغير لسه أكبر من الحد الأقصى", () => {
    expect(validateUploadImageSize(makeBlob(MAX_UPLOAD_IMAGE_SIZE_BYTES + 1))).toBe("تعذر تصغير الصورة لحجم مناسب، جرّب صورة أخرى");
  });

  it("يقبل الحجم عند الحد الأقصى بالضبط", () => {
    expect(validateUploadImageSize(makeBlob(MAX_UPLOAD_IMAGE_SIZE_BYTES))).toBe("");
  });

  it("يقبل حجم أصغر من الحد الأقصى", () => {
    expect(validateUploadImageSize(makeBlob(1000))).toBe("");
  });
});