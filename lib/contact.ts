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
  writeBatch,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { validateContactMessageInput } from "@/lib/contactValidation";
import {
  ContactMessage,
  CreateContactMessageInput,
  UpdateContactMessageInput,
  ContactMessageFilters,
} from "@/types/contact";

const COLLECTION_NAME = "contact_messages";

const toContactMessage = (id: string, data: Record<string, unknown>): ContactMessage => {
  const baseData = {
    senderType: (data.senderType as ContactMessage["senderType"]) ?? "guest",
    senderId: (data.senderId as string) ?? null,
    name: (data.name as string) ?? null,
    city: (data.city as string) ?? null,
    method: (data.method as ContactMessage["method"]) ?? "whatsapp",
    contactValue: (data.contactValue as string) ?? "",
    category: (data.category as ContactMessage["category"]) ?? "general_inquiry",
    message: (data.message as string) ?? "",
    status: (data.status as ContactMessage["status"]) ?? "new",
    adminNotes: (data.adminNotes as string) ?? null,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
  };
  return { ...baseData, id, uid: id } as ContactMessage;
};

// التصحيح الجذري: دالة ذكية تنتظر تحميل جلسة المستخدم من Firebase Auth قبل إطلاق الاستعلام
const requireAdmin = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    
    // إذا كان المستخدم محمل وموجود فعلياً، نمرر الطلب فوراً
    if (auth.currentUser) {
      resolve();
      return;
    }

    // إذا لم يكن محملاً (مثال عند عمل Refresh)، ننتظر أول تغيير لحالة الـ Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve();
      } else {
        reject(new Error("غير مصرح"));
      }
    });
  });
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

// ─── جلب الرسائل ───────────────────────────
export const fetchContactMessages = async (
  filters: ContactMessageFilters & { lastDoc?: DocumentSnapshot; pageSize?: number }
): Promise<{ messages: ContactMessage[]; lastDoc: any }> => {
  await requireAdmin();

  try {
    const constraints: any[] = [];
    if (filters.status && filters.status !== "all" as any) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.category && filters.category !== "all" as any) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters.senderType && filters.senderType !== "all" as any) {
      constraints.push(where("senderType", "==", filters.senderType));
    }
    if (filters.dateFrom) {
      constraints.push(where("createdAt", ">=", Timestamp.fromDate(filters.dateFrom)));
    }
    if (filters.dateTo) {
      constraints.push(where("createdAt", "<=", Timestamp.fromDate(filters.dateTo)));
    }

    const pageSize = filters.pageSize || 50;
    const q = query(
      collection(db, COLLECTION_NAME),
      ...constraints,
      orderBy("createdAt", "desc"),
      limit(pageSize),
      ...(filters.lastDoc ? [startAfter(filters.lastDoc)] : [])
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map((d) => toContactMessage(d.id, d.data()));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return { messages, lastDoc };
  } catch (error) {
    console.error("Firestore Fetch Error:", error);
    throw error;
  }
};

// ─── جلب عدد الرسائل الجديدة ────
export const fetchNewContactMessagesCount = async (): Promise<number> => {
  await requireAdmin();
  const q = query(collection(db, COLLECTION_NAME), where("status", "==", "new"));
  const snapshot = await getDocs(q);
  return snapshot.size;
};

// ─── تحديث ───────────────────
export const updateContactMessage = async (
  messageId: string,
  input: UpdateContactMessageInput
): Promise<void> => {
  await requireAdmin();
  if (!messageId) throw new Error("معرف الرسالة مطلوب");

  await updateDoc(doc(db, COLLECTION_NAME, messageId), {
    ...input,
    updatedAt: Timestamp.now(),
  });
};

// ─── حذف جماعي ───────────
export const deleteContactMessagesBatch = async (
  messageIds: string[]
): Promise<void> => {
  await requireAdmin();
  if (!messageIds?.length) return;

  const batch = writeBatch(db);
  messageIds.forEach((id) => {
    batch.delete(doc(db, COLLECTION_NAME, id));
  });
  await batch.commit();
};