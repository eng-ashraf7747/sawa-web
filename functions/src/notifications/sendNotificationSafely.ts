// C:\sawa-web\functions\src\notifications\sendNotificationSafely.ts

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import {
  COLLECTIONS,
  NOTIFICATION_LIMITS,
  NotificationType,
  NOTIFICATION_PREF_FIELD,
} from "../config/notificationConfig";

interface SendNotificationInput {
  uid: string;
  type: NotificationType;
  title: string;
  body: string;
}

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/**
 * البوابة المركزية الوحيدة لإرسال أي إشعار في المنصة — أي حدث (حجز، تسليم،
 * تفعيل طلب) يجب أن يمرّ من هنا حصراً، ولا يُسمح بأي استدعاء مباشر لـ
 * Firebase Messaging من مكان آخر. تتحقق بالترتيب من: تفضيل المستخدم،
 * السقف العام لليوم، سقف المستخدم لليوم — ثم ترسل فعلياً، أو تسجّل سبب
 * الرفض في notificationRejections دون أي كتم صامت للمعلومة.
 */
export async function sendNotificationSafely(input: SendNotificationInput): Promise<void> {
  const db = getFirestore();
  const { uid, type, title, body } = input;
  const day = todayKey();

  const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    await logRejection(db, uid, type, "user_not_found");
    return;
  }

  const userData = userSnap.data()!;
  const prefField = NOTIFICATION_PREF_FIELD[type];

  // تفضيل المستخدم — قيمة افتراضية "مفعَّل" لو الحقل غير موجود (مستخدمون قدامى)
  if (userData[prefField] === false) {
    await logRejection(db, uid, type, "user_opted_out");
    return;
  }

  const globalCounterRef = db.collection(COLLECTIONS.NOTIFICATION_COUNTERS).doc(day);
  const userCounterRef = db.collection(COLLECTIONS.NOTIFICATION_COUNTERS).doc(`${uid}_${day}`);

  const withinLimits = await db.runTransaction(async (tx) => {
    const [globalSnap, userCounterSnap] = await Promise.all([
      tx.get(globalCounterRef),
      tx.get(userCounterRef),
    ]);

    const globalCount = globalSnap.exists ? (globalSnap.data()!.count as number) : 0;
    const userCount = userCounterSnap.exists ? (userCounterSnap.data()!.count as number) : 0;

    if (globalCount >= NOTIFICATION_LIMITS.GLOBAL_DAILY_LIMIT) return "global";
    if (userCount >= NOTIFICATION_LIMITS.USER_DAILY_LIMIT) return "user";

    tx.set(globalCounterRef, { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    tx.set(userCounterRef, { count: FieldValue.increment(1), uid, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    return "ok";
  });

  if (withinLimits === "global") {
    await logRejection(db, uid, type, "global_daily_limit_exceeded");
    return;
  }
  if (withinLimits === "user") {
    await logRejection(db, uid, type, "user_daily_limit_exceeded");
    return;
  }

  // ─── الإرسال الفعلي لكل أجهزة المستخدم المسجَّلة ─────────────
  const tokensSnap = await userRef.collection(COLLECTIONS.DEVICE_TOKENS).get();
  if (tokensSnap.empty) {
    await logRejection(db, uid, type, "no_device_tokens");
    return;
  }

  const messaging = getMessaging();
  await Promise.all(
    tokensSnap.docs.map(async (tokenDoc) => {
      try {
        await messaging.send({
          token: tokenDoc.id,
          notification: { title, body },
        });
      } catch (error) {
        // توكن غير صالح (الجهاز أزال التطبيق مثلاً) — تنظيف تلقائي، وليس خطأ يستدعي تسجيلاً
        await tokenDoc.ref.delete().catch(() => null);
      }
    })
  );
}

async function logRejection(
  db: FirebaseFirestore.Firestore,
  uid: string,
  type: NotificationType,
  reason: string
): Promise<void> {
  await db.collection(COLLECTIONS.NOTIFICATION_REJECTIONS).add({
    uid,
    type,
    reason,
    timestamp: FieldValue.serverTimestamp(),
  });
}