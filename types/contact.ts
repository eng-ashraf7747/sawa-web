// C:\sawa-web\types\contact.ts

// ─── وسيلة التواصل ─────────────────────────────────────────
export type ContactMessageMethod = "email" | "whatsapp";

// ─── تصنيف الرسالة ─────────────────────────────────────────
export type ContactMessageCategory =
  | "general_inquiry"
  | "technical_issue"
  | "vendor_registration"
  | "suggestion"
  | "complaint"
  | "other";

// ─── حالة الرسالة ──────────────────────────────────────────
export type ContactMessageStatus = "new" | "in_progress" | "resolved";

// ─── نوع المرسل ────────────────────────────────────────────
export type ContactMessageSenderType = "guest" | "user" | "vendor";

// ─── الكيان الكامل كما يُخزَّن في Firestore ────────────────
export interface ContactMessage {
  id: string;
  senderType: ContactMessageSenderType;
  senderId: string | null;
  name: string | null;
  city: string | null;
  method: ContactMessageMethod;
  contactValue: string;
  category: ContactMessageCategory;
  message: string;
  status: ContactMessageStatus;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── مُدخلات إنشاء رسالة جديدة ──────────────────────────────
export type CreateContactMessageInput = {
  senderType: ContactMessageSenderType;
  senderId: string | null;
  name: string | null;
  city: string | null;
  method: ContactMessageMethod;
  contactValue: string;
  category: ContactMessageCategory;
  message: string;
};

// ─── مُدخلات تحديث الأدمن (الحالة + الملاحظات) ──────────────
export type UpdateContactMessageInput = {
  status?: ContactMessageStatus;
  adminNotes?: string | null;
};

// ─── فلاتر شاشة الأدمن ──────────────────────────────────────
export interface ContactMessageFilters {
  status?: ContactMessageStatus | null;
  category?: ContactMessageCategory | null;
  senderType?: ContactMessageSenderType | null;
  dateFrom?: Date | null;
  dateTo: Date | null;
}

// ─── تسميات عربية للعرض ─────────────────────────────────────
export const CONTACT_MESSAGE_CATEGORY_LABELS: Record<ContactMessageCategory, string> = {
  general_inquiry: "استفسار عام",
  technical_issue: "مشكلة تقنية في الموقع",
  vendor_registration: "أرغب في التسجيل كمورد",
  suggestion: "اقتراح فكرة جديدة",
  complaint: "شكوى",
  other: "أخرى",
};

export const CONTACT_MESSAGE_METHOD_LABELS: Record<ContactMessageMethod, string> = {
  email: "إيميل",
  whatsapp: "واتساب",
};

export const CONTACT_MESSAGE_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: "جديد",
  in_progress: "قيد المعالجة",
  resolved: "تم الحل",
};

export const CONTACT_MESSAGE_SENDER_TYPE_LABELS: Record<ContactMessageSenderType, string> = {
  guest: "زائر",
  user: "مستخدم",
  vendor: "مورد",
};