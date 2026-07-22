// lib/messaging.ts

import { getMessaging, getToken, isSupported, onMessage, type MessagePayload } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import app, { db } from "./firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// ─── طلب إذن الإشعارات، والحصول على "توكن الجهاز" ───────────
export async function requestNotificationPermissionAndToken(): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("المتصفح ده مايدعمش الإشعارات");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("المستخدم رفض إذن الإشعارات");
      return null;
    }

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    return token || null;
  } catch (error) {
    console.error("خطأ في الحصول على توكن الإشعارات:", error);
    return null;
  }
}

// ─── حفظ توكن الجهاز مرتبط بحساب المستخدم ───────────────────
// ملاحظة تصميم: معرّف المستند هو التوكن نفسه (لا id عشوائي) — عشان
// لو نفس الجهاز طلب توكن مطابق تاني بالغلط، يستبدل نفسه تلقائياً
// (Idempotent) بدل ما يتكرر كسجل منفصل في قاعدة البيانات.
export async function saveDeviceToken(uid: string, token: string): Promise<void> {
  const tokenRef = doc(db, "users", uid, "deviceTokens", token);
  await setDoc(tokenRef, {
    token,
    createdAt: serverTimestamp(),
    platform: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  });
}
// ─── الاستماع لرسائل الإشعارات وقت فتح الصفحة فعلياً (Foreground) ───────
export async function listenForForegroundMessages(
  callback: (payload: MessagePayload) => void
): Promise<() => void> {
  const supported = await isSupported();
  if (!supported) return () => {};

  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}