// C:\sawa-web\components\shared\PwaRegister.tsx

"use client";

import { useEffect } from "react";

/**
 * تسجيل الـ Service Worker (public/sw.js) عند تحميل أي صفحة —
 * خطوة تأسيسية لتفعيل PWA، بدون أي تأثير على أي وظيفة حالية بالموقع.
 * لا يعرض أي شيء في الواجهة (مكوّن منطقي بحت).
 */
export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("فشل تسجيل Service Worker:", err);
      });
    }
  }, []);

  return null;
}