// lib/messaging.ts

import { getMessaging, getToken, isSupported } from "firebase/messaging";
import app from "./firebase";

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