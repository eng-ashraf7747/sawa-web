// app/test-notifications/page.tsx

"use client";

import { useState } from "react";
import { requestNotificationPermissionAndToken, saveDeviceToken } from "@/lib/messaging";
import { useUser } from "@/hooks/useUser";

export default function TestNotificationsPage() {
  const { userData } = useUser();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleClick = async () => {
    if (!userData) {
      setStatus("لازم تكون مسجَّل دخول الأول");
      return;
    }

    setStatus("جاري الطلب...");
    const result = await requestNotificationPermissionAndToken();

    if (result) {
      setToken(result);
      setStatus("جاري الحفظ...");

      try {
        await saveDeviceToken(userData.uid, result);
        setStatus("تم بنجاح — التوكن اتحفظ في حسابك ✅");
      } catch (error) {
        console.error("خطأ في حفظ التوكن:", error);
        setStatus("التوكن اتاخد بنجاح، لكن فشل حفظه — راجع الكونسول (F12)");
      }
    } else {
      setStatus("فشل — راجع الكونسول (F12) لمعرفة السبب");
    }
  };

  return (
    <div style={{ padding: 40, direction: "rtl", fontFamily: "sans-serif" }}>
      <h1>صفحة اختبار الإشعارات (مؤقتة)</h1>
      <button
        onClick={handleClick}
        style={{
          padding: "12px 24px",
          background: "#1a3c6e",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        اطلب إذن الإشعارات
      </button>

      <p style={{ marginTop: 20 }}>الحالة: {status}</p>

      {token && (
        <div style={{ marginTop: 20, wordBreak: "break-all", background: "#f0f0f0", padding: 12, borderRadius: 8 }}>
          <strong>التوكن:</strong>
          <br />
          {token}
        </div>
      )}
    </div>
  );
}