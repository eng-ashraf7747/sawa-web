// C:\sawa-web\lib\contact.ts

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isValidEmail, isValidEgyptianPhone } from "@/lib/validations";
import {
  ContactMessage,
  CreateContactMessageInput,
  UpdateContactMessageInput,
  ContactMessageFilters,
} from "@/types/contact";

const COLLECTION_NAME = "contact_messages";

// ─── تحويل مستند Firestore إلى ContactMessage ───────────────
const toContactMessage = (id: string, data: Record<string, unknown>): ContactMessage => ({
  id,
  senderType: data.senderType as ContactMessage["senderType"],
  senderId: (data.senderId as string) ?? null,
  name: (data.name as string) ?? null,
  city: (data.city as string) ?? null,
  method: data.method as ContactMessage["method"],
  contactValue: data.contactValue as string,
  category: data.category as ContactMessage["category"],
  message: data.message as string,
  status: data.status as ContactMessage["status"],
  adminNotes: (data.adminNotes as string) ?? null,
  createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
  updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
});

// ─── فحص صحة المُدخلات قبل الحفظ ─────────────────────────────
const validateContactMessageInput = (input: CreateContactMessageInput): string => {
  if (!input.contactValue.trim()) return "بيانات التواصل مطلوبة";

  if (input.method === "email" && !isValidEmail(input.contactValue)) {
    return "بريد إلكتروني غير صالح";
  }

  if (input.method === "whatsapp" && !isValidEgyptianPhone(input.contactValue)) {
    return "رقم واتساب غير صالح";
  }

  if (!input.message.trim()) return "نص الرسالة مطلوب";

  if (input.senderType === "guest" && !input.city) {
    return "المدينة مطلوبة";
  }

  return "";
};

// ─── إرسال رسالة جديدة ───────────────────────────────────────
export const submitContactMessage = async (
  input: CreateContactMessageInput
): Promise<string> => {
  const validationError = validateContactMessageInput(input);
  if (validationError) throw new Error(validationError);

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    senderType: input.senderType,
    senderId: input.senderId,
    name: input.name,
    city: input.city,
    method: input.method,
    contactValue: input.contactValue.trim(),
    category: input.category,
    message: input.message.trim(),
    status: "new",
    adminNotes: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return docRef.id;
};

// ─── جلب الرسائل للأدمن مع الفلاتر ───────────────────────────
export const fetchContactMessages = async (
  filters: ContactMessageFilters
): Promise<ContactMessage[]> => {
  const constraints = [];

  if (filters.status) constraints.push(where("status", "==", filters.status));
  if (filters.category) constraints.push(where("category", "==", filters.category));
  if (filters.dateFrom) constraints.push(where("createdAt", ">=", Timestamp.fromDate(filters.dateFrom)));
  if (filters.dateTo) constraints.push(where("createdAt", "<=", Timestamp.fromDate(filters.dateTo)));

  const q = query(collection(db, COLLECTION_NAME), ...constraints, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => toContactMessage(d.id, d.data()));
};

// ─── جلب عدد الرسائل الجديدة (لـ Badge الـ Sidebar) ──────────
export const fetchNewContactMessagesCount = async (): Promise<number> => {
  const q = query(collection(db, COLLECTION_NAME), where("status", "==", "new"));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// ─── تحديث حالة/ملاحظات رسالة (الأدمن فقط) ───────────────────
export const updateContactMessage = async (
  messageId: string,
  input: UpdateContactMessageInput
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION_NAME, messageId), {
    ...input,
    updatedAt: Timestamp.now(),
  });
};