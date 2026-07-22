// C:\sawa-web\lib\notificationDebugLogger.ts
// تسجيل تشخيصي مؤقت لأي مشكلة في استقبال إشعارات Foreground
// يُفعَّل عند الحاجة فقط عبر استدعائه، ويُوقَف بتعليق نقطة الاستدعاء
// دون حذف الملف نفسه.
export function logForegroundListenerRegistered() {
  console.log("🟢 DEBUG: تم تسجيل مستمع onMessage بنجاح");
}

export function logForegroundUnsupported() {
  console.log("🔴 DEBUG: المتصفح مش داعم Foreground Messages");
}

export function logForegroundMessageReceived(payload: unknown) {
  console.log("🟡 DEBUG: وصلت رسالة Foreground:", payload);
}