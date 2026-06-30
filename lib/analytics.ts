// C:\sawa-web\lib\analytics.ts

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  TrackEventInput,
  TrafficSource,
  DeviceType,
  ANALYTICS_COLLECTIONS,
} from "@/types/analytics";

// ─── كشف نوع الجهاز ──────────────────────────────────────
function detectDevice(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

// ─── كشف مصدر الزيارة ────────────────────────────────────
function detectSource(): TrafficSource {
  if (typeof window === "undefined") return "unknown";

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const ref = params.get("ref");

  if (ref === "referral_code") return "referral_code";
  if (utmSource === "facebook_page") return "facebook_page";
  if (utmSource === "facebook_group") return "facebook_group";
  if (utmSource === "whatsapp") return "whatsapp";
  if (utmSource === "google") return "google";
  if (utmSource === "direct") return "direct";

  const referrer = document.referrer;
  if (referrer.includes("facebook.com")) return "facebook_page";
  if (referrer.includes("google.com")) return "google";
  if (referrer.includes("wa.me") || referrer.includes("whatsapp")) return "whatsapp";

  if (!referrer && !utmSource) return "direct";

  return "unknown";
}

// ─── إنشاء أو جلب Session ID ─────────────────────────────
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sessionId = sessionStorage.getItem("sawa_session_id");
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem("sawa_session_id", sessionId);
    }
    return sessionId;
  } catch {
    return "unknown_session";
  }
}

// ─── حفظ مصدر الزيارة في sessionStorage ─────────────────
export function captureTrafficSource(): void {
  if (typeof window === "undefined") return;
  try {
    const existing = sessionStorage.getItem("sawa_traffic_source");
    if (!existing) {
      const source = detectSource();
      sessionStorage.setItem("sawa_traffic_source", source);
    }
  } catch {
    // تجاهل أخطاء sessionStorage
  }
}

// ─── جلب مصدر الزيارة المحفوظ ────────────────────────────
export function getSavedSource(): TrafficSource {
  if (typeof window === "undefined") return "unknown";
  try {
    const saved = sessionStorage.getItem("sawa_traffic_source");
    return (saved as TrafficSource) ?? detectSource();
  } catch {
    return "unknown";
  }
}

// ─── الدالة المركزية trackEvent ──────────────────────────
export async function trackEvent(input: TrackEventInput): Promise <void> {
  try {
    await addDoc(collection(db, ANALYTICS_COLLECTIONS.EVENTS), {
      eventType: input.eventType,
      userId: input.userId ?? null,
      vendorId: input.vendorId ?? null,
      offerId: input.offerId ?? null,
      categoryId: input.categoryId ?? null,
      bookingId: input.bookingId ?? null,
      requestId: input.requestId ?? null,
      value: input.value ?? null,
      pointsChange: input.pointsChange ?? null,
      metadata: input.metadata ?? {},
      source: getSavedSource(),
      device: detectDevice(),
      sessionId: getOrCreateSessionId(),
      timestamp: serverTimestamp(),
    });
  } catch {
    // لا نوقف العملية الأصلية بسبب خطأ في التتبع
  }
}