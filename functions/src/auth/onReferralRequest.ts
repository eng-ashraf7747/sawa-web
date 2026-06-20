import * as functions from "firebase-functions/v1";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {
  COLLECTIONS,
  REFERRAL,
  REFERRAL_CODE_STATUS,
} from "../config/referralConfig";

const generateReferralCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < REFERRAL.CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

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
    throw new functions.https.HttpsError(
      "failed-precondition",
      "لديك كود إحالة فعال حالياً"
    );
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

  // توليد كود جديد وتفعيله فوراً
  const newCode = generateReferralCode();
  const activatedAt = new Date();

  await userRef.update({
    referralCode: newCode,
    referralStatus: REFERRAL_CODE_STATUS.ACTIVE,
    referralActivatedAt: activatedAt,
    referralUsageCount: 0,
    referralRequestCount: requestCount + 1,
    referralRequestMonth: currentMonth,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    message: "تم تفعيل كود الإحالة الجديد",
    referralCode: newCode,
  };
});