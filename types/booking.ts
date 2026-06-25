// C:\sawa-web\types\booking.ts

// ===== حالات الحجز =====
// pending    → المستخدم ضغط "احصل على العرض" وتواصل مع المورد
// delivered  → المورد سجّل الفاتورة وضغط "تم التسليم"
// completed  → المستخدم ضغط "تم الاستلام" ← هنا تُفتح الاستبيانات
// cancelled  → إلغاء تلقائي بعد 48 ساعة بدون تأكيد المورد

export type BookingStatus =
  | "pending"
  | "delivered"
  | "completed"
  | "cancelled";

// ===== قناة التواصل =====
export type ContactChannel = "whatsapp" | "phone";

// ===== الحجز الكامل =====
export interface Booking {
  id: string;
  userId: string;
  vendorId: string;
  dealId: string;
  dealTitle: string;

  // قناة التواصل التي اختارها المستخدم
  contactChannel: ContactChannel;

  // الحالة
  status: BookingStatus;

  // يسجلها المورد عند الضغط على "تم التسليم"
  orderValue: number | null;

  // مالي — صفر الآن، يتغير بسطر واحد عند التفعيل
  commission: number;        // = orderValue * 0.02 لاحقاً
  vendorPoints: number;      // = orderValue / 10 لاحقاً

  // توقيتات
  createdAt: Date;
  deliveredAt: Date | null;   // وقت ضغط المورد "تم التسليم"
  completedAt: Date | null;   // وقت ضغط المستخدم "تم الاستلام"
  cancelledAt: Date | null;   // وقت الإلغاء التلقائي
}

// ===== إنشاء حجز جديد =====
export type CreateBookingInput = {
  userId: string;
  vendorId: string;
  dealId: string;
  dealTitle: string;
  contactChannel: ContactChannel;
};

// ===== تحديث المورد عند التسليم =====
export type DeliverBookingInput = {
  orderValue: number;
};

// ===== الاستبيانات الثلاثة =====
export type ReviewType =
  | "user_to_product"   // المشتري يقيّم السلعة
  | "user_to_vendor"    // المشتري يقيّم البائع
  | "vendor_to_user";   // البائع يقيّم المشتري

export interface BookingReview {
  id: string;
  bookingId: string;
  userId: string;        // من كتب التقييم
  targetId: string;      // من يُقيَّم (vendorId أو userId)
  type: ReviewType;
  rating: number;        // 1-5
  comment: string | null;

  // التعليق النصي ينتظر موافقة الأدمن
  // التقييم الرقمي يظهر تلقائياً بعد 5 عمليات
  approved: boolean;
  createdAt: Date;
}

export type CreateBookingReviewInput = Omit <
  BookingReview,
  "id" | "approved" | "createdAt"
>;

// ===== ثوابت =====
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   "في انتظار التسليم",
  delivered: "تم التسليم — في انتظار تأكيدك",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const CONTACT_CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: "واتساب",
  phone:    "اتصال هاتفي",
};

export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  user_to_product: "تقييم السلعة",
  user_to_vendor:  "تقييم البائع",
  vendor_to_user:  "تقييم المشتري",
};

// ===== ثوابت مالية — تُعدَّل هنا فقط عند التفعيل =====
export const COMMISSION_RATE = 0;        // 0 الآن - سيصبح 0.02 عند التفعيل
export const POINTS_PER_EGP = 0;         // 0 الآن - سيصبح 0.1 عند التفعيل
export const MAX_COMMISSION_PER_BOOKING = 50;
export const MIN_OPERATIONS_FOR_RATING = 5;
export const BOOKING_CANCEL_HOURS = 48;