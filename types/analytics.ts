// C:\sawa-web\types\analytics.ts

// ─── مصادر الزيارة ────────────────────────────────────────
export type TrafficSource =
  | "facebook_page"
  | "facebook_group"
  | "whatsapp"
  | "referral_code"
  | "direct"
  | "google"
  | "unknown";

// ─── نوع الجهاز ───────────────────────────────────────────
export type DeviceType = "mobile" | "tablet" | "desktop";

// ─── أنواع الأحداث (مقسمة لتسهيل الصيانة) ─────────────────────
export type UserEventType =
  | "user_registered"
  | "user_verified_email"
  | "user_logged_in"
  | "user_profile_completed"
  | "user_referred_someone"
  | "user_used_referral"
  | "user_inactive_7days"
  | "user_inactive_30days"
  | "user_churned";

export type OfferEventType =
  | "offer_viewed"
  | "offer_clicked"
  | "offer_shared"
  | "offer_requested";

export type BookingEventType =
  | "booking_created"
  | "booking_contact_whatsapp"
  | "booking_contact_phone"
  | "booking_delivered"
  | "booking_completed"
  | "booking_cancelled"
  | "booking_auto_cancelled";

export type ReviewEventType =
  | "review_product_submitted"
  | "review_vendor_submitted"
  | "review_user_submitted"
  | "review_approved";

export type PointsEventType =
  | "points_earned_registration"
  | "points_earned_referral"
  | "points_earned_transaction"
  | "points_earned_review"
  | "points_redeemed_subscription"
  | "points_expired";

export type SubscriptionEventType =
  | "subscription_started"
  | "subscription_renewed_cash"
  | "subscription_renewed_points"
  | "subscription_expired"
  | "subscription_cancelled";

export type RequestEventType =
  | "request_created"
  | "request_deleted"
  | "request_fulfilled";

export type VendorEventType =
  | "vendor_registered"
  | "vendor_offer_created"
  | "vendor_offer_approved"
  | "vendor_offer_rejected"
  | "vendor_inactive_7days"
  | "vendor_responded_fast"
  | "vendor_responded_slow";

export type EventType =
  | UserEventType
  | OfferEventType
  | BookingEventType
  | ReviewEventType
  | PointsEventType
  | SubscriptionEventType
  | RequestEventType
  | VendorEventType;

// ─── نوع الحدث الكامل ────────────────────────────────────
export interface AnalyticsEvent {
  id: string;
  eventType: EventType;
  timestamp: Date;
  userId: string | null;
  vendorId: string | null;
  offerId: string | null;
  categoryId: string | null;
  bookingId: string | null;
  requestId: string | null;
  source: TrafficSource;
  device: DeviceType;
  sessionId: string;
  value: number | null;
  pointsChange: number | null;
  metadata: Record<string, unknown>;
  version?: string;
}

// ─── نوع سطر دفتر النقاط (Subcollection) ────────────────────────────────
// هذا هو الشكل الحقيقي المكتوب فعليًا بواسطة الدوال السحابية
// (onUserRegistered.ts, onFirstLogin.ts) تحت المسار: users/{uid}/pointsLedger
// وهو المصدر الوحيد المعتمد لتاريخ النقاط — لا يوجد نظام مواز آخر بعد اليوم.
export type UserPointsLedgerType =
  | "signup_bonus"
  | "referral_joiner_bonus"
  | "referral_owner_bonus"
  | "admin_adjustment";

export interface UserPointsLedgerEntry {
  id: string;
  type: UserPointsLedgerType;
  points: number;
  note: string;
  timestamp: Date;
  referredUser?: string | null;
}

// اسم الـ Subcollection كما هو مكتوب فعليًا في الدوال السحابية (COLLECTIONS.POINTS_LEDGER
// في functions/src/config/referralConfig.ts) — مصدر واحد للحقيقة، القيمة يجب أن تبقى مطابقة له دومًا
export const POINTS_LEDGER_SUBCOLLECTION = "pointsLedger";

// ─── Input لتسجيل حدث ────────────────────────────────────
export interface TrackEventInput {
  eventType: EventType;
  userId?: string | null;
  vendorId?: string | null;
  offerId?: string | null;
  categoryId?: string | null;
  bookingId?: string | null;
  requestId?: string | null;
  value?: number | null;
  pointsChange?: number | null;
  metadata?: Record<string, unknown>;
}

// ─── ثوابت ───────────────────────────────────────────────
export const POINTS_PER_SUBSCRIPTION = 100;
export const SUBSCRIPTION_VALUE_EGP = 50;

export const ANALYTICS_COLLECTIONS = {
  EVENTS: "analytics_events",
} as const;