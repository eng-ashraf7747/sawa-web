// C:\sawa-web\functions\src\notifications\onRequestFulfilled.ts

import * as functions from "firebase-functions/v1";
import { sendNotificationSafely } from "./sendNotificationSafely";
import { COLLECTIONS } from "../config/notificationConfig";

/**
 * إشعار المستخدم عند تفعيل الأدمن لطلبه (status → "fulfilled") — أي
 * ظهور خدمة/عرض يلبّي طلباً كان مسجَّلاً في مسار "الخدمات المطلوبة".
 * نفس مبدأ onBookingDelivered: التحقق من أن الحالة تغيّرت في هذا
 * التحديث تحديداً، لا في كل تعديل لاحق على المستند.
 */
export const onRequestFulfilled = functions
  .region("us-central1")
  .firestore
  .document(`${COLLECTIONS.REQUESTS}/{requestId}`)
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === "fulfilled" || after.status !== "fulfilled") return null;
    if (!after.userId) return null;

    await sendNotificationSafely({
      uid: after.userId,
      type: "requestFulfilled",
      title: "توفّرت عروض على طلبك 🎉",
      body: `الطلب اللي سجّلته ("${after.title ?? "طلبك"}") بقى متاح دلوقتي — شوف العروض الجديدة`,
    });

    return null;
  });