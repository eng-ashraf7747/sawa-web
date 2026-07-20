// C:\sawa-web\public\sw.js

// ملاحظة معمارية: هذا الملف في المرحلة ① بس بيسجّل الـ Service Worker
// كخطوة تأسيسية (متطلب أساسي لأي PWA). منطق استقبال الإشعارات الفعلي
// (Firebase Cloud Messaging) هيُضاف هنا في المرحلة ② القادمة.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});