// C:\sawa-web\hooks\useNotificationPrefs.ts

"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NotificationPrefs, DEFAULT_NOTIFICATION_PREFS } from "@/lib/notificationPrefs";

interface UseNotificationPrefsReturn {
  prefs: NotificationPrefs;
  loading: boolean;
}

// ملاحظة تصميم: أي مستخدم مسجَّل قبل إضافة الميزة دي مش هيكون عنده
// الحقلين دول في مستنده أصلاً. بدل ما نضطر لعمل سكريبت ترحيل بيانات
// (زي حادثة حقل المدينة)، الهوك بيرجّع "true" افتراضياً لأي حقل غير
// موجود — نفس مبدأ toDeal/toRequest بالضبط: قيمة احتياطية آمنة عند
// القراءة، بدل تعديل جماعي على بيانات قديمة.
export const useNotificationPrefs = (uid: string | undefined): UseNotificationPrefsReturn => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", uid),
      (snapshot) => {
        const data = snapshot.data();
        setPrefs({
          notifyBookingUpdates: data?.notifyBookingUpdates ?? true,
          notifyRequestFulfilled: data?.notifyRequestFulfilled ?? true,
        });
        setLoading(false);
      },
      (err) => {
        console.error("خطأ في جلب تفضيلات الإشعارات:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return { prefs, loading };
};