// C:\sawa-web\lib\bookings.ts

import { addCommissionEntry } from "@/lib/commissionLedger";
import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
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
  CancelBookingInput,
  BookingReview,
  CreateBookingReviewInput,
  COMMISSION_RATE,
  POINTS_PER_EGP,
  MAX_COMMISSION_PER_BOOKING,
  MIN_OPERATIONS_FOR_RATING,
  calculateRatingAverage,
} from "@/types/booking";
import { trackEvent } from "@/lib/analytics";

function toBooking(id: string, data: any): Booking {
  return {
    id,
    userId: data.userId,
    vendorId: data.vendorId,
    dealId: data.dealId,
    dealTitle: data.dealTitle,
    dealDiscount: data.dealDiscount ?? "",
    dealCategory: data.dealCategory ?? "",
    userName: data.userName ?? "",
    vendorName: data.vendorName ?? "",
    contactChannel: data.contactChannel,
    status: data.status,
    orderValue: data.orderValue ?? null,
    commission: data.commission ?? 0,
    vendorPoints: data.vendorPoints ?? 0,
    isFirstBooking: data.isFirstBooking ?? false,
    isFirstBookingWithVendor: data.isFirstBookingWithVendor ?? false,
    isReferral: data.isReferral ?? false,
    cancellationReason: data.cancellationReason ?? null,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    deliveredAt: data.deliveredAt
      ? (data.deliveredAt as Timestamp).toDate()
      : null,
    completedAt: data.completedAt
      ? (data.completedAt as Timestamp).toDate()
      : null,
    cancelledAt: data.cancelledAt
      ? (data.cancelledAt as Timestamp).toDate()
      : null,
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
      cancellationReason: null,
      createdAt: serverTimestamp(),
      deliveredAt: null,
      completedAt: null,
      cancelledAt: null,
    });

    await trackEvent({
      eventType: "booking_created",
      userId: input.userId,
      vendorId: input.vendorId,
      offerId: input.dealId,
      categoryId: input.dealCategory,
      bookingId: ref.id,
      metadata: {
        contactChannel: input.contactChannel,
        isFirstBooking: input.isFirstBooking,
        isFirstBookingWithVendor: input.isFirstBookingWithVendor,
        isReferral: input.isReferral,
      },
    });

    return ref.id;
  } catch (error) {
    console.error("createBooking error:", error);
    throw new Error("تعذر إنشاء الحجز");
  }
}

export async function markDelivered(
  bookingId: string,
  input: DeliverBookingInput
): Promise <void> {
  try {
    const bookingRef = doc(db, "bookings", bookingId);

    // التحقق المبكر من وجود الحجز قبل أي تحديث (Fail Fast)
    // ملاحظة تصميم: لا نستخدم runTransaction هنا عمداً، لأن addCommissionEntry
    // في lib/commissionLedger.ts تستخدم addDoc عادية (لا تقبل كائن transaction) —
    // لو استُدعيت من داخل runTransaction وحدث Retry بسبب تعارض، ستُنفَّذ
    // addCommissionEntry أكثر من مرة فعلياً، ما يعني قيد عمولة مكرر في القاعدة.
    // التزامن الحقيقي يتطلب أولاً تعديل addCommissionEntry لتقبل transaction،
    // وهذا قرار منفصل يخص lib/commissionLedger.ts.
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error("الحجز غير موجود");
    }
    const bookingData = bookingSnap.data();

    const commission = Math.min(
      input.orderValue * COMMISSION_RATE,
      MAX_COMMISSION_PER_BOOKING
    );
    const vendorPoints = Math.floor(input.orderValue * POINTS_PER_EGP);

    await updateDoc(bookingRef, {
      status: "delivered" as BookingStatus,
      orderValue: input.orderValue,
      commission,
      vendorPoints,
      deliveredAt: serverTimestamp(),
    });

    await addCommissionEntry({
      bookingId,
      userId: bookingData.userId ?? "",
      vendorId: bookingData.vendorId ?? "",
      categoryId: bookingData.dealCategory ?? "",
      invoiceValue: input.orderValue,
      commissionRate: COMMISSION_RATE,
      commissionCap: MAX_COMMISSION_PER_BOOKING,
    });

    await trackEvent({
      eventType: "booking_delivered",
      bookingId,
      value: input.orderValue,
      metadata: { commission, vendorPoints },
    });
  } catch (error) {
    console.error("markDelivered error:", error);
    throw new Error("تعذر تحديث حالة الحجز");
  }
}

export async function markCompleted(
  bookingId: string
): Promise <void> {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "completed" as BookingStatus,
      completedAt: serverTimestamp(),
    });

    await trackEvent({
      eventType: "booking_completed",
      bookingId,
    });
  } catch (error) {
    console.error("markCompleted error:", error);
    throw new Error("تعذر تأكيد الاستلام");
  }
}

export async function cancelBooking(
  bookingId: string,
  input?: CancelBookingInput
): Promise <void> {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      status: "cancelled" as BookingStatus,
      cancellationReason: input?.cancellationReason ?? null,
      cancelledAt: serverTimestamp(),
    });

    await trackEvent({
      eventType: "booking_cancelled",
      bookingId,
      metadata: { reason: input?.cancellationReason ?? null },
    });
  } catch (error) {
    console.error("cancelBooking error:", error);
    throw new Error("تعذر إلغاء الحجز");
  }
}

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

export async function createBookingReview(
  input: CreateBookingReviewInput
): Promise <string> {
  try {
    const ref = await addDoc(collection(db, "bookingReviews"), {
      ...input,
      approved: false,
      createdAt: serverTimestamp(),
    });

    await trackEvent({
      eventType: "review_product_submitted",
      userId: input.userId,
      bookingId: input.bookingId,
      metadata: {
        type: input.type,
        rating: input.rating,
      },
    });

    return ref.id;
  } catch (error) {
    console.error("createBookingReview error:", error);
    throw new Error("تعذر إضافة التقييم");
  }
}

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
      // limit(50) // أضف pagination لاحقاً
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toBookingReview(d.id, d.data()));
  } catch (error) {
    console.error("getVendorReviews error:", error);
    throw new Error("تعذر جلب التقييمات");
  }
}

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
    if (snap.size < MIN_OPERATIONS_FOR_RATING) return null;
    const total = snap.docs.reduce(
      (sum, d) => sum + (d.data().rating ?? 0),
      0
    );
    return { average: total / snap.size, count: snap.size };
  } catch (error) {
    console.error("getVendorRatingAverage error:", error);
    throw new Error("تعذر حساب متوسط التقييم");
  }
}

// ==========================================
// PRC-RVW-04 — تقييم السلعة/الصفقة (user_to_product)
// ==========================================

/**
 * جلب متوسط تقييم صفقة/سلعة معينة (PRC-RVW-04)
 * يعتمد على مجموعة bookingReviews بنفس نمط getVendorRatingAverage تماماً،
 * لكن بنوع user_to_product وبمعرّف الصفقة (dealId) بدل المورد
 *
 * ملاحظة تصميم مقصودة: هذه الدالة مستقلة تماماً عن getVendorRatingAverage
 * أعلاه (لا تشاركها أي كود) لتفادي أي تعديل على دالة شغالة فعلياً في الإنتاج.
 * حساب المتوسط نفسه (calculateRatingAverage) مستورد من types/booking.ts —
 * وليس معرَّفاً هنا — لأنها دالة نقية لا علاقة لها بـ Firestore، ووضعها
 * هناك يبقيها قابلة للاختبار دون تحميل هذا الملف بأكمله (الذي يستورد db).
 */
export async function getProductRatingAverage(
  dealId: string
): Promise <{ average: number; count: number } | null> {
  try {
    const q = query(
      collection(db, "bookingReviews"),
      where("targetId", "==", dealId),
      where("type", "==", "user_to_product")
    );
    const snap = await getDocs(q);
    const ratings = snap.docs.map((d) => d.data().rating ?? 0);
    return calculateRatingAverage(ratings);
  } catch (error) {
    console.error("getProductRatingAverage error:", error);
    throw new Error("تعذر حساب متوسط تقييم السلعة");
  }
}

// ==========================================
// تقييم المشترين (vendor_to_user) — صفحة "تقييم المشترين"
// ==========================================

/**
 * جلب كل التقييمات اللي كتبها مورد معيّن عن مشتريه (النوع vendor_to_user)
 * تُستخدم فقط داخل صفحة المورد الخاصة (app/vendor/customers)، وليست عرضاً عاماً
 *
 * ملاحظات تصميم مقصودة:
 * 1) الفلترة بحقل userId (وليس targetId كباقي الدوال) لأننا هنا نبحث عن
 *    التقييمات التي كتبها هذا المورد، لا التقييمات الموجهة إليه
 * 2) لا يوجد orderBy على السيرفر عمداً — هذا الاستعلام (userId + type)
 *    تركيبة حقول مختلفة عن أي استعلام آخر بالمشروع، وقد يحتاج فهرساً
 *    مركّباً جديداً في Firestore حتى بدون ترتيب. الترتيب (لو احتجناه) يتم
 *    بالكود بعد وصول البيانات، تفادياً لتكرار مفاجأة الفهرس الناقص السابقة
 * 3) لا فلترة على approved — هذا الحقل مخصص لتحكم عرض التقييمات العامة
 *    للجمهور، بينما هذه شاشة داخلية للمورد نفسه فقط
 */
export async function getReviewsGivenByVendor(
  vendorId: string
): Promise <BookingReview[]> {
  try {
    const q = query(
      collection(db, "bookingReviews"),
      where("userId", "==", vendorId),
      where("type", "==", "vendor_to_user")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toBookingReview(d.id, d.data()));
  } catch (error) {
    console.error("getReviewsGivenByVendor error:", error);
    throw new Error("تعذر جلب تقييمات المشترين");
  }
}

// ==========================================
// دوال فلترة الحجوزات (Client-Side)
// ==========================================

/**
 * تحويل التاريخ إلى نص بصيغة YYYY-MM-DD بالتوقيت المحلي
 * لتجنب مشكلة التحويل التلقائي لتوقيت جرينتش (UTC)
 */
export function formatDateToLocal(date: Date | null | undefined): string {
  if (!date || !(date instanceof Date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * الحصول على النطاق الزمني الافتراضي
 * يعيد نفس اليوم من الشهر الماضي إلى اليوم الحالي
 */
export function getDefaultDateRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  return {
    from: formatDateToLocal(from),
    to: formatDateToLocal(now),
  };
}

/**
 * استخراج تاريخ الحجز كنص محلي
 * يدعم أنواع التواريخ المختلفة (Firebase Timestamp, Date, String)
 */
function extractLocalDateStr(createdAt: any): string {
  if (!createdAt) return "";
  let date: Date | null = null;

  if (createdAt.toDate && typeof createdAt.toDate === "function") {
    date = createdAt.toDate(); // حالة Firestore Timestamp
  } else if (createdAt instanceof Date) {
    date = createdAt;
  } else if (typeof createdAt === "string") {
    date = new Date(createdAt);
  }

  return formatDateToLocal(date);
}

/**
 * فلترة مصفوفة الحجوزات بناءً على الحالات المحددة والنطاق الزمني
 */
export function filterBookings(
  bookings: Booking[],
  selectedStatuses: string[],
  fromDate: string,
  toDate: string
): Booking[] {
  if (!bookings?.length) return [];

  return bookings.filter((booking) => {
    // 1. التحقق من الحالة (لو مفيش حالات محددة، يعرض الكل)
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(booking.status)) {
      return false;
    }

    // 2. التحقق من التاريخ
    const bookingDateStr = extractLocalDateStr(booking.createdAt);
    if (fromDate && bookingDateStr < fromDate) return false;
    if (toDate && bookingDateStr > toDate) return false;

    return true;
  });
}