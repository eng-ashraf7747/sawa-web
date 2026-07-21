// C:\sawa-web\functions\src\config\notificationConfig.ts

export const COLLECTIONS = {
  USERS: "users",
  DEVICE_TOKENS: "deviceTokens",
  NOTIFICATION_COUNTERS: "notificationCounters",
  NOTIFICATION_REJECTIONS: "notificationRejections",
};

// ─── سقوف الإرسال الآمن (20 يوليو 2026) ─────────────────────
export const NOTIFICATION_LIMITS = {
  GLOBAL_DAILY_LIMIT: 3000,
  USER_DAILY_LIMIT: 10,
};

// ─── أنواع الإشعارات المدعومة حالياً ──────────────────────────
// كل نوع مرتبط بحقل تفضيل واحد في users/{uid} (بُني في المرحلة ④)
export type NotificationType = "bookingUpdate" | "requestFulfilled";

export const NOTIFICATION_PREF_FIELD: Record<NotificationType, string> = {
  bookingUpdate: "notifyBookingUpdates",
  requestFulfilled: "notifyRequestFulfilled",
};