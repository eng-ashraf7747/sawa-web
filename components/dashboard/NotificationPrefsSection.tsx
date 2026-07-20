// C:\sawa-web\components\dashboard\NotificationPrefsSection.tsx

"use client";

import { useUser } from "@/hooks/useUser";
import { useNotificationPrefs } from "@/hooks/useNotificationPrefs";
import { updateNotificationPref, NotificationPrefs } from "@/lib/notificationPrefs";

const PREF_LABELS: Record<keyof NotificationPrefs, string> = {
  notifyBookingUpdates: "تحديثات الحجوزات (تسليم وطلبات جديدة)",
  notifyRequestFulfilled: "توفر عروض على طلب سبق وسجّلته",
};

export default function NotificationPrefsSection() {
  const { userData } = useUser();
  const { prefs, loading } = useNotificationPrefs(userData?.uid);

  const handleToggle = async (key: keyof NotificationPrefs) => {
    if (!userData) return;
    await updateNotificationPref(userData.uid, key, !prefs[key]);
  };

  if (loading) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-6 lg:p-8 mt-6" dir="rtl">
      <h2 className="text-lg md:text-xl font-bold text-[#0f172a] mb-6">تفضيلات الإشعارات</h2>

      <div className="space-y-4">
        {(Object.keys(PREF_LABELS) as (keyof NotificationPrefs)[]).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{PREF_LABELS[key]}</span>
            <button
              onClick={() => handleToggle(key)}
              role="switch"
              aria-checked={prefs[key]}
              aria-label={PREF_LABELS[key]}
              className={`relative w-11 h-6 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e] ${
                prefs[key] ? "bg-[#1a3c6e]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  prefs[key] ? "translate-x-0.5" : "translate-x-5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}