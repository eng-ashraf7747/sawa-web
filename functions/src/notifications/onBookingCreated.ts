// C:\sawa-web\functions\src\notifications\onBookingCreated.ts

import * as functions from "firebase-functions/v1";
import { getFirestore } from "firebase-admin/firestore";
import { sendNotificationSafely } from "./sendNotificationSafely";
import { COLLECTIONS } from "../config/notificationConfig";

/**
 * إشعار المورد فوراً عند إنشاء حجز جديد على أحد عروضه.
 * تستمع لإنشاء أي مستند جديد في bookings — لا تُستدعى مباشرة من
 * lib/bookings.ts (الذي يعمل في متصفح المستخدم)، بل تُفعَّل تلقائياً
 * من Firestore نفسه فور الإنشاء، بنفس نمط onFirstLogin.ts الموجود.
 */
export const onBookingCreated = functions
  .region("us-central1")
  .firestore
  .document(`${COLLECTIONS.BOOKINGS}/{bookingId}`)
  .onCreate(async (snapshot) => {
    const booking = snapshot.data();

    if (!booking.vendorId) return null;

    const db = getFirestore();
    const vendorSnap = await db.collection(COLLECTIONS.USERS).doc(booking.vendorId).get();
    if (!vendorSnap.exists) return null;

    await sendNotificationSafely({
      uid: booking.vendorId,
      type: "bookingUpdate",
      title: "حجز جديد 📦",
      body: `وصلك حجز جديد على "${booking.dealTitle ?? "أحد عروضك"}"`,
    });

    return null;
  });