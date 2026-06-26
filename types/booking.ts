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