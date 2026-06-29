// C:\sawa-web\lib\requests.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Request,
  CreateRequestInput,
  RequestStatus,
  MAX_REQUESTS_PER_USER,
} from "@/types/request";
import { trackEvent } from "@/lib/analytics";

const COLLECTION = "requests";
const requestsRef = () => collection(db, COLLECTION);

function toRequest(id: string, data: any): Request {
  return {
    id,
    userId: data.userId,
    userName: data.userName ?? "",
    categoryId: data.categoryId,
    categoryName: data.categoryName ?? "",
    subcategoryId: data.subcategoryId,
    subcategoryName: data.subcategoryName ?? "",
    title: data.title ?? "",
    description: data.description ?? "",
    status: data.status ?? "pending",
    interestedCount: data.interestedCount ?? 1,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
    fulfilledAt: data.fulfilledAt
      ? (data.fulfilledAt as Timestamp).toDate()
      : null,
  };
}

// ─── إنشاء طلب جديد ──────────────────────────────────────
export async function createOrUpdateRequest(
  input: CreateRequestInput
): Promise <{ id: string; isNew: boolean }> {

  const userRequests = await getDocs(
    query(
      requestsRef(),
      where("userId", "==", input.userId),
      where("status", "==", "pending")
    )
  );

  if (userRequests.size >= MAX_REQUESTS_PER_USER) {
    throw new Error(`وصلت للحد الأقصى من الطلبات (${MAX_REQUESTS_PER_USER})`);
  }

  const ref = await addDoc(requestsRef(), {
    ...input,
    status: "pending" as RequestStatus,
    interestedCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    fulfilledAt: null,
  });

  await incrementSubcategoryCount(input.subcategoryId, 1);

  await trackEvent({
    eventType: "request_created",
    userId: input.userId,
    categoryId: input.categoryId,
    requestId: ref.id,
    metadata: {
      subcategoryId: input.subcategoryId,
      subcategoryName: input.subcategoryName,
      categoryName: input.categoryName,
    },
  });

  return { id: ref.id, isNew: true };
}

// ─── حذف طلب ─────────────────────────────────────────────
export async function deleteRequest(
  requestId: string,
  subcategoryId: string,
  userId?: string
): Promise <void> {
  await deleteDoc(doc(db, COLLECTION, requestId));
  await incrementSubcategoryCount(subcategoryId, -1);

  await trackEvent({
    eventType: "request_deleted",
    userId: userId ?? null,
    requestId,
    metadata: { subcategoryId },
  });
}

// ─── تنفيذ الطلب (الأدمن) ────────────────────────────────
export async function fulfillRequest(
  requestId: string,
  subcategoryId: string
): Promise <void> {
  await updateDoc(doc(db, COLLECTION, requestId), {
    status: "fulfilled" as RequestStatus,
    fulfilledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await incrementSubcategoryCount(subcategoryId, -1);

  await trackEvent({
    eventType: "request_fulfilled",
    requestId,
    metadata: { subcategoryId },
  });
}

// ─── جلب طلبات المستخدم ──────────────────────────────────
export async function getUserRequests(
  userId: string
): Promise <Request[]> {
  const q = query(
    requestsRef(),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toRequest(d.id, d.data()));
}

// ─── جلب كل الطلبات (الأدمن) ────────────────────────────
export async function getAllRequests(): Promise <Request[]> {
  const q = query(
    requestsRef(),
    where("status", "==", "pending"),
    orderBy("interestedCount", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toRequest(d.id, d.data()));
}

// ─── جلب عدد طلبات المستخدم النشطة ──────────────────────
export async function getUserActiveRequestsCount(
  userId: string
): Promise <number> {
  const q = query(
    requestsRef(),
    where("userId", "==", userId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.size;
}

// ─── زيادة/تقليل عداد المهتمين ───────────────────────────
async function incrementSubcategoryCount(
  subcategoryId: string,
  value: number
): Promise <void> {
  try {
    const ref = doc(db, "subcategoryStats", subcategoryId);
    await updateDoc(ref, { interestedCount: increment(value) });
  } catch {
    // لو الـ document غير موجود نتجاهل الخطأ
  }
}

// ─── جلب عداد المهتمين لفئة فرعية ───────────────────────
export async function getSubcategoryInterestedCount(
  subcategoryId: string
): Promise <number> {
  try {
    const ref = doc(db, "subcategoryStats", subcategoryId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data()?.interestedCount ?? 0) : 0;
  } catch {
    return 0;
  }
}