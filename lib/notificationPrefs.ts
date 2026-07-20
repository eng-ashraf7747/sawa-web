// C:\sawa-web\lib\notificationPrefs.ts

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface NotificationPrefs {
  notifyBookingUpdates: boolean;
  notifyRequestFulfilled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  notifyBookingUpdates: true,
  notifyRequestFulfilled: true,
};

// ─── تحديث تفضيل واحد بس (Toggle) ───────────────────────
export async function updateNotificationPref(
  uid: string,
  key: keyof NotificationPrefs,
  value: boolean
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    [key]: value,
  });
}