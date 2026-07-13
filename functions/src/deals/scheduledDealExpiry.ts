// C:\sawa-web\functions\src\deals\scheduledDealExpiry.ts

import * as functions from "firebase-functions/v1";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

/**
 * مهمة مجدولة (نفس نمط functions/src/auth/scheduledExpiry.ts تماماً):
 * تعطيل الصفقات تلقائياً بعد تجاوز تاريخ انتهائها (expiresAt)، بغض النظر
 * عن وجود أي زائر يفتح الموقع في تلك اللحظة — تعمل كل 60 دقيقة على السيرفر
 *
 * ملاحظة تصميم: expiresAt حقل اختياري بالكامل (المورد/الأدمن غير مُلزمين
 * بتحديده) — استعلام Firestore بشرط "<=" يستبعد تلقائياً أي صفقة لم يُحدَّد
 * لها تاريخ انتهاء أصلاً، فلا حاجة لفحص إضافي على وجود الحقل من عدمه
 *
 * الأثر: بمجرد تحديث الحالة هنا، الشاشات الثلاث (المستخدم، المورد، الأدمن)
 * تعرض التغيير تلقائياً — كلها تعتمد على مراقبة لحظية (onSnapshot) لنفس
 * المجموعة، فلا حاجة لأي تعديل في أي منها
 */
export const scheduledDealExpiry = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async () => {
    const db = getFirestore();
    const now = new Date();

    const snapshot = await db
      .collection("deals")
      .where("status", "==", "active")
      .where("expiresAt", "<=", now)
      .get();

    if (snapshot.empty) return null;

    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: "inactive",
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    return null;
  });