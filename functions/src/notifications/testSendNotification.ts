// C:\sawa-web\functions\src\notifications\testSendNotification.ts

import * as functions from "firebase-functions/v1";
import { sendNotificationSafely } from "./sendNotificationSafely";

/**
 * دالة اختبار مؤقتة — تُستخدم فقط للتأكد من عمل بوابة الإرسال الآمنة
 * (sendNotificationSafely) بمعزل عن أي حدث حقيقي، قبل ربطها بالمرحلة ⑥.
 * تُحذف بعد التأكد من نجاح الاختبار الحي.
 */
export const testSendNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  await sendNotificationSafely({
    uid: context.auth.uid,
    type: "bookingUpdate",
    title: "إشعار تجريبي 🔔",
    body: "لو وصلك الإشعار ده، يبقى بوابة الإرسال شغّالة صح!",
  });

  return { success: true };
});