// C:\sawa-web\types\booking.ts

export type BookingStatus =
  | "pending"
  | "delivered"
  | "completed"
  | "cancelled";

export type ContactChannel = "whatsapp" | "phone";

export interface Booking {
  id: string;

  // معرفات الأطراف
  userId: string;
  vendorId: string;
  dealId: string;

  // بيانات snapshot - تُحفظ وقت الإنشاء ولا تتغير
  dealTitle: string;
  dealDiscount: string;
  dealCategory: string;
  userName: string;
  vendorName: string;

  // قناة التواصل
  contactChannel: ContactChannel;

  // الحالة
  status: BookingStatus;

  // يسجلها المورد عند التسليم
  orderValue: number | null;

  // مالي - صفر الآن
  commission: number;
  vendorPoints: number;

  // سياق العملية - يُحسب تلقائياً
  isFirstBooking: boolean;
  isFirstBookingWithVendor: boolean;
  isReferral: boolean;
  cancellationReason: string | null;

  // توقيتات
  createdAt: Date;
  deliveredAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
}

export type CreateBookingInput = {
  userId: string;
  vendorId: string;
  dealId: string;
  dealTitle: string;
  dealDiscount: string;
  dealCategory: string;
  userName: string;
  vendorName: string;
  contactChannel: ContactChannel;
  isFirstBooking: boolean;
  isFirstBookingWithVendor: boolean;
  isReferral: boolean;
};

export type DeliverBookingInput = {
  orderValue: number;
};

export type CancelBookingInput = {
  cancellationReason: string;
};

export type ReviewType =
  | "user_to_product"
  | "user_to_vendor"
  | "vendor_to_user";

export interface BookingReview {
  id: string;
  bookingId: string;
  userId: string;
  targetId: string;
  type: ReviewType;
  rating: number;
  comment: string | null;
  approved: boolean;
  createdAt: Date;
}

export type CreateBookingReviewInput = Omit <
  BookingReview,
  "id" | "approved" | "createdAt"
>;

export const BOOKING_STATUS_LABELS: Record <BookingStatus, string> = {
  pending:   "في انتظار التسليم",
  delivered: "تم التسليم — في انتظار تأكيدك",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const CONTACT_CHANNEL_LABELS: Record <ContactChannel, string> = {
  whatsapp: "واتساب",
  phone:    "اتصال هاتفي",
};

export const REVIEW_TYPE_LABELS: Record <ReviewType, string> = {
  user_to_product: "تقييم السلعة",
  user_to_vendor:  "تقييم البائع",
  vendor_to_user:  "تقييم المشتري",
};

export const COMMISSION_RATE = 0;
export const POINTS_PER_EGP = 0;
export const MAX_COMMISSION_PER_BOOKING = 50;
export const MIN_OPERATIONS_FOR_RATING = 5;
export const BOOKING_CANCEL_HOURS = 48;

// ==========================================
// PRC-RVW-04 — حساب متوسط التقييم (دالة نقية)
// ==========================================

/**
 * حساب متوسط التقييم وعدد المقيّمين من مصفوفة تقييمات خام
 * يُرجع null إذا كان عدد التقييمات أقل من الحد الأدنى المطلوب لعرض نتيجة موثوقة
 *
 * موضوعة هنا عمداً (وليس في lib/bookings.ts أو ملف جديد منفصل):
 * هذا الملف صفر استيرادات (لا يستورد Firebase أو أي شيء آخر)، وهو أصلاً
 * البيت الحالي لكل ثوابت وأنواع التقييمات (ReviewType, BookingReview,
 * MIN_OPERATIONS_FOR_RATING) — إضافة الدالة هنا تفادت مشكلة حقيقية:
 * وضعها سابقاً داخل lib/bookings.ts كان يجرّ عند الاختبار تحميل
 * lib/firebase.ts (عبر استيراد db) وبالتالي firebase/auth، التي تحتاج
 * fetch غير المتاح في بيئة Jest — النتيجة: فشل تشغيل ملف الاختبار بالكامل.
 */
export function calculateRatingAverage(
  ratings: number[],
  minCount: number = MIN_OPERATIONS_FOR_RATING
): { average: number; count: number } | null {
  if (ratings.length < minCount) return null;
  const total = ratings.reduce((sum, r) => sum + (r ?? 0), 0);
  return { average: total / ratings.length, count: ratings.length };
}