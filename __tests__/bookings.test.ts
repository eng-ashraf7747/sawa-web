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
} from "@/types/booking";

describe("booking constants", () => {
  it("COMMISSION_RATE يساوي صفر في مرحلة MVP", () => {
    expect(COMMISSION_RATE).toBe(0);
  });

  it("POINTS_PER_EGP يساوي صفر في مرحلة MVP", () => {
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