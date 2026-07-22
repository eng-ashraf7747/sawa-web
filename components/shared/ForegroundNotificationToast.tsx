// C:\sawa-web\components\shared\ForegroundNotificationToast.tsx
"use client";

import { useEffect, useState } from "react";
import { listenForForegroundMessages } from "@/lib/messaging";

interface ToastData {
  title: string;
  body: string;
}

export default function ForegroundNotificationToast() {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    listenForForegroundMessages((payload) => {
      setToast({
        title: payload.notification?.title ?? "إشعار جديد",
        body: payload.notification?.body ?? "",
      });
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setToast(null), 5000);
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      role="status"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[90%] bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3"
    >
      <p className="text-sm font-bold text-[#1a3c6e]">{toast.title}</p>
      {toast.body && <p className="text-xs text-gray-600 mt-1">{toast.body}</p>}
    </div>
  );
}