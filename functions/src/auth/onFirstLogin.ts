import * as functions from "firebase-functions/v1";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {
  COLLECTIONS,
  POINTS,
  POINTS_LEDGER_TYPES,
} from "../config/referralConfig";

export const onFirstLogin = functions.auth.user().beforeSignIn(async (user) => {
  if (!user.emailVerified) return;

  const db = getFirestore();
  const userRef = db.collection(COLLECTIONS.USERS).doc(user.uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) return;

  const userData = userSnap.data()!;

  // لو سبق منح نقاط الإحالة — لا نكرر
  if (userData.referralBonusGranted) return;

  // لو مفيش referredBy — لا نكمل
  if (!userData.referredBy) return;

  const referredBy = userData.referredBy as string;
  const now = FieldValue.serverTimestamp();
  const batch = db.batch();

  // +5 للمستخدم الجديد
  batch.update(userRef, {
    points: FieldValue.increment(POINTS.REFERRAL_JOINER_BONUS),
    referralBonusGranted: true,
    updatedAt: now,
  });

  const joinerLedgerRef = db
    .collection(COLLECTIONS.USERS)
    .doc(user.uid)
    .collection(COLLECTIONS.POINTS_LEDGER)
    .doc();

  batch.set(joinerLedgerRef, {
    type: POINTS_LEDGER_TYPES.REFERRAL_JOINER_BONUS,
    points: POINTS.REFERRAL_JOINER_BONUS,
    timestamp: now,
    note: "نقاط الإحالة — مستخدم جديد",
  });

  // +5 لصاحب الكود
  const ownerRef = db.collection(COLLECTIONS.USERS).doc(referredBy);
  batch.update(ownerRef, {
    points: FieldValue.increment(POINTS.REFERRAL_OWNER_BONUS),
    updatedAt: now,
  });

  const ownerLedgerRef = db
    .collection(COLLECTIONS.USERS)
    .doc(referredBy)
    .collection(COLLECTIONS.POINTS_LEDGER)
    .doc();

  batch.set(ownerLedgerRef, {
    type: POINTS_LEDGER_TYPES.REFERRAL_OWNER_BONUS,
    points: POINTS.REFERRAL_OWNER_BONUS,
    timestamp: now,
    note: "نقاط الإحالة — صاحب الكود",
    referredUser: user.uid,
  });

  await batch.commit();
});