import * as functions from "firebase-functions/v1";
import {getFirestore, FieldValue} from "firebase-admin/firestore";
import {COLLECTIONS, REFERRAL, REFERRAL_CODE_STATUS} from "../config/referralConfig";

export const scheduledExpiry = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async () => {
    const db = getFirestore();
    const now = new Date();
    const expiryTime = new Date(now.getTime() - REFERRAL.CODE_VALIDITY_HOURS * 60 * 60 * 1000);

    const snapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("referralStatus", "==", REFERRAL_CODE_STATUS.ACTIVE)
      .where("referralActivatedAt", "<=", expiryTime)
      .get();

    if (snapshot.empty) return null;

    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        referralStatus: REFERRAL_CODE_STATUS.EXPIRED,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    return null;
  });