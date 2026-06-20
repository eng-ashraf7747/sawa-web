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
    const db = getFirestore();
    const now = FieldValue.serverTimestamp();
    const referralCode = generateReferralCode();
    const activatedAt = new Date();

    const batch = db.batch();

    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    batch.set(userRef, {
      referralCode,
      referralStatus: REFERRAL_CODE_STATUS.ACTIVE,
      referralActivatedAt: activatedAt,
      referralUsageCount: 0,
      referralRequestCount: 0,
      referralRequestMonth: `${activatedAt.getFullYear()}-${activatedAt.getMonth() + 1}`,
      points: POINTS.SIGNUP_BONUS,
      updatedAt: now,
    }, {merge: true});

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