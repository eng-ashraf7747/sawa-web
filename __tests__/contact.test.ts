// C:\sawa-web\__tests__\contact.test.ts

import { validateContactMessageInput } from "@/lib/contactValidation";
import {
  CONTACT_MESSAGE_CATEGORY_LABELS,
  CONTACT_MESSAGE_METHOD_LABELS,
  CONTACT_MESSAGE_STATUS_LABELS,
  CONTACT_MESSAGE_SENDER_TYPE_LABELS,
  CreateContactMessageInput,
} from "@/types/contact";

const buildValidGuestInput = (
  overrides: Partial<CreateContactMessageInput> = {}
): CreateContactMessageInput => ({
  senderType: "guest",
  senderId: null,
  name: "أحمد",
  city: "fayoum",
  method: "whatsapp",
  contactValue: "01012345678",
  category: "general_inquiry",
  message: "رسالة تجريبية",
  ...overrides,
});

// ─── validateContactMessageInput ─────────────────────────────
describe("validateContactMessageInput", () => {
  it("يقبل مُدخلات زائر صحيحة بالكامل (واتساب)", () => {
    expect(validateContactMessageInput(buildValidGuestInput())).toBe("");
  });

  it("يقبل مُدخلات صحيحة بالكامل (إيميل)", () => {
    const input = buildValidGuestInput({
      method: "email",
      contactValue: "test@gmail.com",
    });
    expect(validateContactMessageInput(input)).toBe("");
  });

  it("يرفض بيانات تواصل فارغة", () => {
    const input = buildValidGuestInput({ contactValue: "  " });
    expect(validateContactMessageInput(input)).toBe("بيانات التواصل مطلوبة");
  });

  it("يرفض إيميل غير صالح عند اختيار وسيلة الإيميل", () => {
    const input = buildValidGuestInput({
      method: "email",
      contactValue: "not-an-email",
    });
    expect(validateContactMessageInput(input)).toBe("بريد إلكتروني غير صالح");
  });

  it("يرفض رقم واتساب غير صالح", () => {
    const input = buildValidGuestInput({ contactValue: "123" });
    expect(validateContactMessageInput(input)).toBe("رقم واتساب غير صالح");
  });

  it("لا يخلط بين قواعد الإيميل والواتساب: رقم هاتف مرفوض كإيميل", () => {
    const input = buildValidGuestInput({
      method: "email",
      contactValue: "01012345678",
    });
    expect(validateContactMessageInput(input)).toBe("بريد إلكتروني غير صالح");
  });

  it("يرفض رسالة فارغة", () => {
    const input = buildValidGuestInput({ message: "   " });
    expect(validateContactMessageInput(input)).toBe("نص الرسالة مطلوب");
  });

  it("يرفض زائراً بدون مدينة", () => {
    const input = buildValidGuestInput({ city: null });
    expect(validateContactMessageInput(input)).toBe("المدينة مطلوبة");
  });

  it("لا يشترط مدينة لمستخدم مسجل", () => {
    const input = buildValidGuestInput({ senderType: "user", city: null });
    expect(validateContactMessageInput(input)).toBe("");
  });

  it("لا يشترط مدينة لمورد مسجل", () => {
    const input = buildValidGuestInput({ senderType: "vendor", city: null });
    expect(validateContactMessageInput(input)).toBe("");
  });
});

// ─── تسميات العرض ─────────────────────────────────────────────
describe("CONTACT_MESSAGE_CATEGORY_LABELS", () => {
  it("يحتوي على تسمية لكل تصنيف من التصنيفات الستة", () => {
    expect(CONTACT_MESSAGE_CATEGORY_LABELS.general_inquiry).toBe("استفسار عام");
    expect(CONTACT_MESSAGE_CATEGORY_LABELS.technical_issue).toBe("مشكلة تقنية في الموقع");
    expect(CONTACT_MESSAGE_CATEGORY_LABELS.vendor_registration).toBe("أرغب في التسجيل كمورد");
    expect(CONTACT_MESSAGE_CATEGORY_LABELS.suggestion).toBe("اقتراح فكرة جديدة");
    expect(CONTACT_MESSAGE_CATEGORY_LABELS.complaint).toBe("شكوى");
    expect(CONTACT_MESSAGE_CATEGORY_LABELS.other).toBe("أخرى");
  });
});

describe("CONTACT_MESSAGE_METHOD_LABELS", () => {
  it("يحتوي على تسمية لكل وسيلة تواصل", () => {
    expect(CONTACT_MESSAGE_METHOD_LABELS.email).toBe("إيميل");
    expect(CONTACT_MESSAGE_METHOD_LABELS.whatsapp).toBe("واتساب");
  });
});

describe("CONTACT_MESSAGE_STATUS_LABELS", () => {
  it("يحتوي على تسمية لكل حالة من الحالات الثلاث", () => {
    expect(CONTACT_MESSAGE_STATUS_LABELS.new).toBe("جديد");
    expect(CONTACT_MESSAGE_STATUS_LABELS.in_progress).toBe("قيد المعالجة");
    expect(CONTACT_MESSAGE_STATUS_LABELS.resolved).toBe("تم الحل");
  });
});

describe("CONTACT_MESSAGE_SENDER_TYPE_LABELS", () => {
  it("يحتوي على تسمية لكل نوع مرسل", () => {
    expect(CONTACT_MESSAGE_SENDER_TYPE_LABELS.guest).toBe("زائر");
    expect(CONTACT_MESSAGE_SENDER_TYPE_LABELS.user).toBe("مستخدم");
    expect(CONTACT_MESSAGE_SENDER_TYPE_LABELS.vendor).toBe("مورد");
  });
});