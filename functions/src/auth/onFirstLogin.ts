import * as functions from "firebase-functions/v1";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {
  COLLECTIONS,
  POINTS,
  POINTS_LEDGER_TYPES,
} from "../config/referralConfig";

export const onFirstLogin = functions
  .region("us-central1")
  .firestore
  .document(`${COLLECTIONS.USERS}/{uid}`)
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const uid = context.params.uid;

    if (before.emailVerified || !after.emailVerified) return null;
    if (after.referralBonusGranted) return null;
    if (!after.referredBy) return null;

    const referredBy = after.referredBy as string;
    const db = getFirestore();
    const now = FieldValue.serverTimestamp();
    const batch = db.batch();

    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);

    batch.update(userRef, {
      points: FieldValue.increment(POINTS.REFERRAL_JOINER_BONUS),
      referralBonusGranted: true,
      updatedAt: now,
    });

    const joinerLedgerRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.POINTS_LEDGER)
      .doc();

    batch.set(joinerLedgerRef, {
      type: POINTS_LEDGER_TYPES.REFERRAL_JOINER_BONUS,
      points: POINTS.REFERRAL_JOINER_BONUS,
      timestamp: now,
      note: "نقاط الإحالة — مستخدم جديد",
    });

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
      referredUser: uid,
    });

    await batch.commit();
    return null;
  });