// C:\sawa-web\lib\vendorProfile.ts

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VendorProfile, UpdateVendorProfileInput } from "@/types/vendorProfile";

const COLLECTION = "vendorProfiles";

// ─── Get Vendor Profile (one-time) ───────────────────────
export const getVendorProfile = async (
  vendorId: string
): Promise<VendorProfile | null> => {
  const snap = await getDoc(doc(db, COLLECTION, vendorId));
  if (!snap.exists()) return null;
  return { vendorId: snap.id, ...snap.data() } as VendorProfile;
};

// ─── Stream Vendor Profile (real-time) ───────────────────
export const streamVendorProfile = (
  vendorId: string,
  callback: (profile: VendorProfile | null) => void,
  onError: (error: Error) => void
) => {
  return onSnapshot(
    doc(db, COLLECTION, vendorId),
    (snap) => {
      if (snap.exists()) {
        callback({ vendorId: snap.id, ...snap.data() } as VendorProfile);
      } else {
        callback(null);
      }
    },
    onError
  );
};

// ─── Create or Update Vendor Profile ─────────────────────
export const saveVendorProfile = async (
  vendorId: string,
  input: UpdateVendorProfileInput
): Promise<void> => {
  const ref = doc(db, COLLECTION, vendorId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      ...input,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      ...input,
      vendorId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

// ==========================================
// عدّاد استخدام تقرير "تقييم المشترين" الشهري
// ==========================================

// الحد الأقصى مسموح به شهرياً - راجع نقاش القرار في hooks/useBookingReviews.ts
const MAX_BUYER_REPORT_REQUESTS_PER_MONTH = 5;

/**
 * التحقق من عدّاد استخدام تقرير المشترين الشهري وتحديثه في نفس العملية
 * (نفس منطق عدّاد طلبات كود الإحالة في onReferralRequest.ts تماماً،
 * لكن Client-Side وليس Cloud Function — راجع الملاحظة المهمة أدناه)
 *
 * ⚠️ ملاحظة أمان مقصودة ومتفق عليها:
 * هذا العدّاد حماية من التكلفة الزائدة (تقليل قراءات Firestore غير الضرورية)،
 * وليس حماية أمان حقيقية ضد تلاعب متعمّد — بخلاف عدّاد الإحالة (Cloud Function
 * على السيرفر) الذي يحمي ميزة فيها مصلحة مادية مباشرة للمستخدم إن تلاعب بها.
 * هنا، المورد لا يكسب أي شيء من تجاوز العدّاد (يشاهد بياناته فقط)، فالتلاعب
 * بأدوات المطوّر غير منطقي عملياً. القرار: عدّاد Client-Side كافٍ حالياً،
 * ويُنقل لاحقاً إلى Cloud Function عند تنفيذ قواعد أمان Firestore الشاملة.
 *
 * يُرجع { allowed, remaining } — allowed=false يعني تجاوز الحد هذا الشهر
 */
export const checkAndIncrementBuyerReportUsage = async (
  vendorId: string
): Promise<{ allowed: boolean; remaining: number }> => {
  const ref = doc(db, COLLECTION, vendorId);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

  const currentCount =
    data.buyerReportRequestMonth === currentMonth
      ? (data.buyerReportRequestCount ?? 0)
      : 0;

  if (currentCount >= MAX_BUYER_REPORT_REQUESTS_PER_MONTH) {
    return { allowed: false, remaining: 0 };
  }

  const newCount = currentCount + 1;

  await updateDoc(ref, {
    buyerReportRequestCount: newCount,
    buyerReportRequestMonth: currentMonth,
    updatedAt: serverTimestamp(),
  });

  return {
    allowed: true,
    remaining: MAX_BUYER_REPORT_REQUESTS_PER_MONTH - newCount,
  };
};