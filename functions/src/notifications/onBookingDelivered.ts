// C:\sawa-web\functions\src\notifications\onBookingDelivered.ts

import * as functions from "firebase-functions/v1";
import { sendNotificationSafely } from "./sendNotificationSafely";
import { COLLECTIONS } from "../config/notificationConfig";

/**
 * إشعار المستخدم فوراً عند تسليم المورد لحجزه (status → "delivered").
 * يتحقق من أن الحالة تغيّرت فعلاً في هذا التحديث تحديداً (لا في كل
 * تحديث لاحق على نفس الحجز)، لتفادي إرسال إشعارات مكررة عند أي
 * تعديل آخر غير متعلق بالتسليم.
 */
export const onBookingDelivered = functions
  .region("us-central1")
  .firestore
  .document(`${COLLECTIONS.BOOKINGS}/{bookingId}`)
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === "delivered" || after.status !== "delivered") return null;
    if (!after.userId) return null;

    await sendNotificationSafely({
      uid: after.userId,
      type: "bookingUpdate",
      title: "تم تسليم طلبك ✅",
      body: `المورد سلّم طلبك على "${after.dealTitle ?? "الحجز"}" — أكّد الاستلام من حسابك`,
    });

    return null;
  });