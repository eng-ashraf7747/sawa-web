import * as functions from "firebase-functions/v1";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {
  COLLECTIONS,
  REFERRAL,
  REFERRAL_CODE_STATUS,
  REFERRAL_REQUEST_STATUS,
} from "../config/referralConfig";

export const onReferralRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  const uid = context.auth.uid;
  const db = getFirestore();
  const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    throw new functions.https.HttpsError("not-found", "المستخدم غير موجود");
  }

  const userData = userSnap.data()!;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

  // التحقق من كود Active
  if (userData.referralStatus === REFERRAL_CODE_STATUS.ACTIVE) {
    throw new functions.https.HttpsError("failed-precondition", "لديك كود إحالة فعال حالياً");
  }

  // التحقق من طلب Pending
  if (userData.referralStatus === REFERRAL_CODE_STATUS.PENDING) {
    throw new functions.https.HttpsError("failed-precondition", "لديك طلب قيد المراجعة");
  }

  // التحقق من عدد الطلبات في الشهر
  const requestCount = userData.referralRequestMonth === currentMonth
    ? (userData.referralRequestCount || 0)
    : 0;

  if (requestCount >= REFERRAL.MAX_MONTHLY_REQUESTS) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      "لقد استنفدت الحد الأقصى لطلبات الكود هذا الشهر"
    );
  }

  // إنشاء الطلب
  const batch = db.batch();

  batch.update(userRef, {
    referralStatus: REFERRAL_CODE_STATUS.PENDING,
    referralRequestCount: requestCount + 1,
    referralRequestMonth: currentMonth,
    referralRequestedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const requestRef = db.collection(COLLECTIONS.REFERRAL_CODE_REQUESTS).doc();
  batch.set(requestRef, {
    uid,
    status: REFERRAL_REQUEST_STATUS.PENDING,
    requestedAt: FieldValue.serverTimestamp(),
    displayName: userData.displayName || "",
    email: userData.email || "",
  });

  await batch.commit();

  return {success: true, message: "تم إرسال طلبك للمراجعة"};
});