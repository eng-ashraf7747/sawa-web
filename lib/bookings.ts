// C:\sawa-web\lib\bookings.ts

import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  Booking,
  BookingStatus,
  CreateBookingInput,
  DeliverBookingInput,
  BookingReview,
  CreateBookingReviewInput,
  COMMISSION_RATE,
  POINTS_PER_EGP,
  MAX_COMMISSION_PER_BOOKING,
} from "@/types/booking";

// ===== تحويل Firestore document =====
function toBooking(id: string, data: any): Booking {
  return {
    id,
    userId: data.userId,
    vendorId: data.vendorId,
    dealId: data.dealId,
    dealTitle: data.dealTitle,
    contactChannel: data.contactChannel,
    status: data.status,
    orderValue: data.orderValue ?? null,
    commission: data.commission ?? 0,
    vendorPoints: data.vendorPoints ?? 0,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    deliveredAt: data.deliveredAt ? (data.deliveredAt as Timestamp).toDate() : null,
    completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : null,
    cancelledAt: data.cancelledAt ? (data.cancelledAt as Timestamp).toDate() : null,
  };
}

function toBookingReview(id: string, data: any): BookingReview {
  return {
    id,
    bookingId: data.bookingId,
    userId: data.userId,
    targetId: data.targetId,
    type: data.type,
    rating: data.rating,
    comment: data.comment ?? null,
    approved: data.approved ?? false,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}

// ===== المستخدم ينشئ حجزاً =====
export async function createBooking(
  input: CreateBookingInput
): Promise <string> {
  try {
    const ref = await addDoc(collection(db, "bookings"), {
      ...input,
      status: "pending" as BookingStatus,
      orderValue: null,
      commission: 0,
      vendorPoints: 0,
      createdAt: serverTimestamp(),
      deliveredAt: null,
      completedAt: null,
      cancelledAt: null,
    });
    return ref.id;
  } catch (error) {
    console.error("createBooking error:", error);
    throw new Error("تعذر إنشاء الحجز");
  }
}

// ===== المورد يسجل الفاتورة ويضغط تم التسليم =====
export async function markDelivered(
  bookingId: string,
  input: DeliverBookingInput
): Promise <void> {
  try {
    const commission = Math.min(
      input.orderValue * COMMISSION_RATE,
      MAX_COMMISSION_PER_BOOKING
    );
    const vendorPoints = Math.floor(input.orderValue * POINTS_PER_EGP);

    await updateDoc(doc(db, "bookings", bookingId), {
      status: "delivered" as BookingStatus,
      orderValue: input.orderValue,
      commission,
      vendorPoints,
      deliveredAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("markDelivered error:", error);
    throw new Error("تعذر تحديث حالة الحجز");
  }
}

// ===== المستخدم يضغط تم الاستلام =====
export async function markCompleted(
  bookingId: string
): Promise <void> {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "completed" as BookingStatus,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("markCompleted error:", error);
    throw new Error("تعذر تأكيد الاستلام");
  }
}

// ===== إلغاء الحجز =====
export async function cancelBooking(
  bookingId: string
): Promise <void> {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "cancelled" as BookingStatus,
      cancelledAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("cancelBooking error:", error);
    throw new Error("تعذر إلغاء الحجز");
  }
}

// ===== جلب حجوزات المستخدم =====
export async function getUserBookings(
  userId: string
): Promise <Booking[]> {
  try {
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toBooking(d.id, d.data()));
  } catch (error) {
    console.error("getUserBookings error:", error);
    throw new Error("تعذر جلب الحجوزات");
  }
}

// ===== جلب حجوزات المورد =====
export async function getVendorBookings(
  vendorId: string
): Promise <Booking[]> {
  try {
    const q = query(
      collection(db, "bookings"),
      where("vendorId", "==", vendorId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toBooking(d.id, d.data()));
  } catch (error) {
    console.error("getVendorBookings error:", error);
    throw new Error("تعذر جلب الحجوزات");
  }
}

// ===== إضافة تقييم =====
export async function createBookingReview(
  input: CreateBookingReviewInput
): Promise <string> {
  try {
    const ref = await addDoc(collection(db, "bookingReviews"), {
      ...input,
      approved: false,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    console.error("createBookingReview error:", error);
    throw new Error("تعذر إضافة التقييم");
  }
}

// ===== جلب تقييمات المورد المعتمدة =====
export async function getVendorReviews(
  vendorId: string
): Promise <BookingReview[]> {
  try {
    const q = query(
      collection(db, "bookingReviews"),
      where("targetId", "==", vendorId),
      where("type", "==", "user_to_vendor"),
      where("approved", "==", true),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toBookingReview(d.id, d.data()));
  } catch (error) {
    console.error("getVendorReviews error:", error);
    throw new Error("تعذر جلب التقييمات");
  }
}

// ===== جلب متوسط تقييم المورد =====
export async function getVendorRatingAverage(
  vendorId: string
): Promise <{ average: number; count: number } | null> {
  try {
    const q = query(
      collection(db, "bookingReviews"),
      where("targetId", "==", vendorId),
      where("type", "==", "user_to_vendor")
    );
    const snap = await getDocs(q);
    if (snap.size < 5) return null;
    const total = snap.docs.reduce((sum, d) => sum + (d.data().rating ?? 0), 0);
    return { average: total / snap.size, count: snap.size };
  } catch (error) {
    console.error("getVendorRatingAverage error:", error);
    throw new Error("تعذر حساب متوسط التقييم");
  }
}