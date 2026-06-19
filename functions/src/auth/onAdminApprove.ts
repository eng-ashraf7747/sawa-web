import * as functions from "firebase-functions/v1";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {
  COLLECTIONS,
  REFERRAL,
  REFERRAL_CODE_STATUS,
  REFERRAL_REQUEST_STATUS,
} from "../config/referralConfig";

const generateReferralCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < REFERRAL.CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const onAdminApprove = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  // التحقق من صلاحية الأدمن
  const db = getFirestore();
  const adminRef = db.collection(COLLECTIONS.USERS).doc(context.auth.uid);
  const adminSnap = await adminRef.get();

  if (!adminSnap.exists || adminSnap.data()!.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "غير مصرح بهذه العملية");
  }

  const {requestId, action} = data as {requestId: string; action: "approve" | "reject"};

  if (!requestId || !action) {
    throw new functions.https.HttpsError("invalid-argument", "بيانات غير مكتملة");
  }

  const requestRef = db.collection(COLLECTIONS.REFERRAL_CODE_REQUESTS).doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new functions.https.HttpsError("not-found", "الطلب غير موجود");
  }

  const requestData = requestSnap.data()!;
  const uid = requestData.uid as string;
  const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();

  if (action === "approve") {
    const newCode = generateReferralCode();
    const activatedAt = new Date();

    batch.update(userRef, {
      referralCode: newCode,
      referralStatus: REFERRAL_CODE_STATUS.ACTIVE,
      referralActivatedAt: activatedAt,
      referralUsageCount: 0,
      updatedAt: now,
    });

    batch.update(requestRef, {
      status: REFERRAL_REQUEST_STATUS.APPROVED,
      resolvedAt: now,
      resolvedBy: context.auth.uid,
    });

    await batch.commit();
    return {success: true, message: "تم تفعيل الكود الجديد"};
  }

  if (action === "reject") {
    batch.update(userRef, {
      referralStatus: REFERRAL_CODE_STATUS.REJECTED,
      updatedAt: now,
    });

    batch.update(requestRef, {
      status: REFERRAL_REQUEST_STATUS.REJECTED,
      resolvedAt: now,
      resolvedBy: context.auth.uid,
    });

    await batch.commit();
    return {success: true, message: "تم رفض الطلب"};
  }

  throw new functions.https.HttpsError("invalid-argument", "action غير صالح");
});