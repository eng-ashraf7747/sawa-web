// C:\sawa-web\lib\deals.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Deal, CreateDealInput, UpdateDealInput } from "@/types/deal";

const COLLECTION = "deals";
const dealsRef = () => collection(db, COLLECTION);

/**
 * تحويل مستند Firestore الخام إلى Deal بأنواع صحيحة فعلياً وقت التشغيل
 * (وليس فقط وقت الترجمة) — نفس نمط toBooking/toBookingReview في
 * lib/bookings.ts بالضبط
 *
 * ⚠️ إصلاح باج حقيقي: كل دوال القراءة هنا كانت تستخدم سابقاً
 * `{ id: d.id, ...d.data() } as Deal` — تحويل ساذج (Unsafe Cast) لا يحوّل
 * حقول Firestore Timestamp (createdAt, updatedAt, expiresAt) إلى Date
 * فعلياً. TypeScript كان "يصدّق" أنها Date وقت الترجمة، لكنها في وقت
 * التشغيل كائنات Timestamp خام (لا تملك .getTime() أصلاً) — ما تسبب في
 * انهيار formatDealExpiryLabel() فور استدعاء expiresAt.getTime() عليها.
 * لم تظهر المشكلة قبل الآن لأن أياً من createdAt/updatedAt لم يُستخدم
 * سابقاً بأي دالة خاصة بـ Date.
 */
function toDeal(id: string, data: any): Deal {
  return {
    id,
    categoryId: data.categoryId,
    vendorId: data.vendorId ?? null,
    vendorName: data.vendorName ?? null,
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl ?? null,
    discount: data.discount,
    externalUrl: data.externalUrl ?? null,
    expiresAt: data.expiresAt ? (data.expiresAt as Timestamp).toDate() : null,
    status: data.status,
    order: data.order ?? 1,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
    city: data.city ?? "fayoum",
  };
}

// ─── Add Deal ─────────────────────────────────────────────
export const addDeal = async (input: CreateDealInput): Promise<string> => {
  const docRef = await addDoc(dealsRef(), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ─── Update Deal ──────────────────────────────────────────
export const updateDeal = async (
  id: string,
  input: UpdateDealInput
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
};

// ─── Delete Deal ──────────────────────────────────────────
export const deleteDeal = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// ─── Toggle Active/Inactive (Admin) ───────────────────────
export const toggleDealActive = async (
  id: string,
  current: boolean
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    status: current ? "inactive" : "active",
    updatedAt: serverTimestamp(),
  });
};

// ─── Approve Deal (Admin) ─────────────────────────────────
export const approveDeal = async (id: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    status: "active",
    updatedAt: serverTimestamp(),
  });
};

// ─── Reject Deal (Admin) ──────────────────────────────────
export const rejectDeal = async (id: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    status: "rejected",
    updatedAt: serverTimestamp(),
  });
};

// ─── Stream All Deals by Category (Admin) ────────────────
export const streamDealsByCategory = (
  categoryId: string,
  callback: (deals: Deal[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    dealsRef(),
    where("categoryId", "==", categoryId),
    orderBy("order", "asc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => toDeal(d.id, d.data())));
    },
    onError
  );
};

// ─── Stream Pending Deals (Admin) ────────────────────────
export const streamPendingDeals = (
  callback: (deals: Deal[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    dealsRef(),
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => toDeal(d.id, d.data())));
    },
    onError
  );
};

// ─── Stream Active Deals by Category (User) ──────────────
export const streamActiveDealsByCategory = (
  categoryId: string,
  city: string,
  callback: (deals: Deal[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    dealsRef(),
    where("categoryId", "==", categoryId),
    where("status", "==", "active"),
    where("city", "==", city),
    orderBy("order", "asc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => toDeal(d.id, d.data())));
    },
    onError
  );
};

// ─── Stream Vendor Deals (Vendor) ────────────────────────
export const streamVendorDeals = (
  vendorId: string,
  callback: (deals: Deal[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    dealsRef(),
    where("vendorId", "==", vendorId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => toDeal(d.id, d.data())));
    },
    onError
  );
};