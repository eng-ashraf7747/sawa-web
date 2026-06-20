import * as functions from "firebase-functions/v1";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {
  COLLECTIONS,
  POINTS,
  REFERRAL,
  REFERRAL_CODE_STATUS,
  POINTS_LEDGER_TYPES,
} from "../config/referralConfig";

const generateReferralCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < REFERRAL.CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const onUserRegistered = functions
  .region("us-central1")
  .firestore
  .document(`${COLLECTIONS.USERS}/{uid}`)
  .onCreate(async (snap, context) => {
    const uid = context.params.uid;
    const data = snap.data();
    const db = getFirestore();
    const now = FieldValue.serverTimestamp();
    const referralCode = generateReferralCode();
    const activatedAt = new Date();

    const batch = db.batch();
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);

    // ─── حل موضوع referredBy ───────────────────────────────
    let referredByUid: string | null = null;
    const referredByCode = data?.referredBy as string | null;

    if (referredByCode) {
      // البحث عن صاحب الكود بالـ referralCode
      const ownerQuery = await db
        .collection(COLLECTIONS.USERS)
        .where("referralCode", "==", referredByCode)
        .limit(1)
        .get();

      if (!ownerQuery.empty) {
        const ownerDoc = ownerQuery.docs[0];
        const ownerData = ownerDoc.data();

        // التحقق من أن الكود صالح (أقل من 48 ساعة)
        const activatedAtOwner = ownerData.referralActivatedAt?.toDate?.() as Date | undefined;
        if (activatedAtOwner) {
          const hoursDiff = (Date.now() - activatedAtOwner.getTime()) / (1000 * 60 * 60);
          if (hoursDiff <= REFERRAL.CODE_VALIDITY_HOURS &&
            ownerData.referralStatus === REFERRAL_CODE_STATUS.ACTIVE) {
            referredByUid = ownerDoc.id;

            // تحديث عداد استخدام الكود عند صاحبه
            batch.update(ownerDoc.ref, {
              referralUsageCount: FieldValue.increment(1),
              updatedAt: now,
            });
          }
        }
      }
    }

    // ─── تحديث بيانات المستخدم الجديد ──────────────────────
    batch.set(userRef, {
      referralCode,
      referralStatus: REFERRAL_CODE_STATUS.ACTIVE,
      referralActivatedAt: activatedAt,
      referralUsageCount: 0,
      referralRequestCount: 0,
      referralRequestMonth: `${activatedAt.getFullYear()}-${activatedAt.getMonth() + 1}`,
      points: POINTS.SIGNUP_BONUS,
      referredBy: referredByUid, // نحفظ الـ uid مش الكود
      updatedAt: now,
    }, {merge: true});

    // ─── سجل النقاط ─────────────────────────────────────────
    const ledgerRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.POINTS_LEDGER)
      .doc();

    batch.set(ledgerRef, {
      type: POINTS_LEDGER_TYPES.SIGNUP_BONUS,
      points: POINTS.SIGNUP_BONUS,
      timestamp: now,
      note: "نقاط التسجيل",
    });

    await batch.commit();
  });