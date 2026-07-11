//C:\sawa-web\__tests__\bookings.test.ts

import {
  COMMISSION_RATE,
  POINTS_PER_EGP,
  MAX_COMMISSION_PER_BOOKING,
  MIN_OPERATIONS_FOR_RATING,
  BOOKING_CANCEL_HOURS,
  BOOKING_STATUS_LABELS,
  CONTACT_CHANNEL_LABELS,
  REVIEW_TYPE_LABELS,
  calculateRatingAverage,
} from "@/types/booking";

describe("booking constants", () => {
  it("COMMISSION_RATE يساوي 0 في مرحلة MVP", () => {
    expect(COMMISSION_RATE).toBe(0);
  });

  it("POINTS_PER_EGP يساوي 0 في مرحلة MVP", () => {
    expect(POINTS_PER_EGP).toBe(0);
  });

  it("MAX_COMMISSION_PER_BOOKING يساوي 50", () => {
    expect(MAX_COMMISSION_PER_BOOKING).toBe(50);
  });

  it("MIN_OPERATIONS_FOR_RATING يساوي 5", () => {
    expect(MIN_OPERATIONS_FOR_RATING).toBe(5);
  });

  it("BOOKING_CANCEL_HOURS يساوي 48", () => {
    expect(BOOKING_CANCEL_HOURS).toBe(48);
  });
});

describe("BOOKING_STATUS_LABELS", () => {
  it("pending له label صحيح", () => {
    expect(BOOKING_STATUS_LABELS.pending).toBe("في انتظار التسليم");
  });

  it("delivered له label صحيح", () => {
    expect(BOOKING_STATUS_LABELS.delivered).toBe("تم التسليم — في انتظار تأكيدك");

  });

  it("completed له label صحيح", () => {
    expect(BOOKING_STATUS_LABELS.completed).toBe("مكتمل");
  });

  it("cancelled له label صحيح", () => {
    expect(BOOKING_STATUS_LABELS.cancelled).toBe("ملغي");
  });
});

describe("CONTACT_CHANNEL_LABELS", () => {
  it("whatsapp له label صحيح", () => {
    expect(CONTACT_CHANNEL_LABELS.whatsapp).toBe("واتساب");
  });

  it("phone له label صحيح", () => {
    expect(CONTACT_CHANNEL_LABELS.phone).toBe("اتصال هاتفي");
  });
});

describe("REVIEW_TYPE_LABELS", () => {
  it("user_to_product له label صحيح", () => {
    expect(REVIEW_TYPE_LABELS.user_to_product).toBe("تقييم السلعة");
  });

  it("user_to_vendor له label صحيح", () => {
    expect(REVIEW_TYPE_LABELS.user_to_vendor).toBe("تقييم البائع");
  });

  it("vendor_to_user له label صحيح", () => {
    expect(REVIEW_TYPE_LABELS.vendor_to_user).toBe("تقييم المشتري");
  });
});

// ==========================================
// PRC-RVW-04 — calculateRatingAverage (دالة نقية من types/booking.ts)
// ==========================================
describe("calculateRatingAverage", () => {
  it("يُرجع null لو عدد التقييمات أقل من الحد الأدنى الافتراضي (5)", () => {
    expect(calculateRatingAverage([5, 4, 3, 4])).toBeNull();
  });

  it("يُرجع null لمصفوفة فارغة", () => {
    expect(calculateRatingAverage([])).toBeNull();
  });

  it("يُرجع نتيجة صحيحة عند الوصول للحد الأدنى بالضبط (5 تقييمات)", () => {
    const result = calculateRatingAverage([5, 5, 5, 5, 5]);
    expect(result).toEqual({ average: 5, count: 5 });
  });

  it("يحسب المتوسط بشكل صحيح مع أرقام عشرية", () => {
    const result = calculateRatingAverage([5, 4, 3, 4, 5]);
    expect(result?.average).toBeCloseTo(4.2, 5);
    expect(result?.count).toBe(5);
  });

  it("يحسب المتوسط بشكل صحيح لأكثر من الحد الأدنى", () => {
    const result = calculateRatingAverage([5, 5, 4, 3, 2, 1, 5]);
    expect(result?.count).toBe(7);
    expect(result?.average).toBeCloseTo(25 / 7, 5);
  });

  it("يحترم minCount مخصص أقل من الافتراضي", () => {
    const result = calculateRatingAverage([4, 5], 2);
    expect(result).toEqual({ average: 4.5, count: 2 });
  });

  it("يحترم minCount مخصص ويرفض لو لسه أقل منه", () => {
    expect(calculateRatingAverage([5], 2)).toBeNull();
  });

  it("يُرجع null لمصفوفة فارغة حتى مع minCount مخصص صغير (1)", () => {
    expect(calculateRatingAverage([], 1)).toBeNull();
  });

  it("يتعامل مع قيم صفرية داخل المصفوفة دون كسر الحساب", () => {
    const result = calculateRatingAverage([0, 5, 5, 5, 5]);
    expect(result?.average).toBeCloseTo(4, 5);
    expect(result?.count).toBe(5);
  });

  it("يتعامل مع قيم null/undefined داخل المصفوفة (بيانات Firestore غير مكتملة)", () => {
    const result = calculateRatingAverage([5, null as any, 5, undefined as any, 5]);
    expect(result?.average).toBeCloseTo(3, 5);
    expect(result?.count).toBe(5);
  });
});