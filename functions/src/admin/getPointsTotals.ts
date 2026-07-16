// C:\sawa-web\functions\src\admin\getPointsTotals.ts

import * as functions from "firebase-functions/v1";
import {getFirestore, Timestamp} from "firebase-admin/firestore";
import {COLLECTIONS} from "../config/referralConfig";

/**
 * getPointsTotals — حساب إجمالي النقاط الممنوحة والمستردة في فترة زمنية
 *
 * ملاحظة معمارية (16 يوليو 2026): هذا الحساب كان يتم سابقاً من المتصفح مباشرة
 * (lib/pointsLedger.ts) عبر collectionGroup على users/{uid}/pointsLedger،
 * وكان يُرفض دائماً بقواعد الأمان — لأن قاعدة الحماية على pointsLedger مبنية
 * على مطابقة {userId} من مسار المستند، وقواعد Firestore لا تستطيع تقييم
 * دالة get() (للتحقق من دور الأدمن) بأمان عبر استعلام Collection Group يمس
 * مستندات مستخدمين متعددين دفعة واحدة. الحل المعياري: النقل للسيرفر —
 * Cloud Functions تعمل بصلاحية admin SDK الكاملة وغير خاضعة لقواعد الأمان.
 *
 * التحقق من الصلاحية هنا يدوي وإلزامي: الدالة ترفض أي مستدعٍ ليس admin
 * (بقراءة role من مستند المستخدم — نفس مصدر الحقيقة المستخدم في القواعد).
 */
export const getPointsTotals = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "يجب تسجيل الدخول أولاً");
  }

  const db = getFirestore();

  // ─── التحقق من صلاحية الأدمن ─────────────────────────────
  const callerSnap = await db
    .collection(COLLECTIONS.USERS)
    .doc(context.auth.uid)
    .get();

  if (!callerSnap.exists || callerSnap.data()?.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "هذه العملية متاحة للأدمن فقط"
    );
  }

  // ─── التحقق من مُدخلات الفترة ────────────────────────────
  const startMs = Number(data?.startMs);
  const endMs = Number(data?.endMs);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "نطاق التاريخ غير صالح"
    );
  }

  const start = Timestamp.fromMillis(startMs);
  const end = Timestamp.fromMillis(endMs);

  // ─── الحساب الشامل عبر دفاتر نقاط كل المستخدمين ─────────
  const snap = await db
    .collectionGroup("pointsLedger")
    .where("timestamp", ">=", start)
    .where("timestamp", "<=", end)
    .get();

  let totalGranted = 0;
  let totalRedeemed = 0;

  snap.docs.forEach((d) => {
    const points = d.data().points ?? 0;
    if (points > 0) {
      totalGranted += points;
    } else if (points < 0) {
      totalRedeemed += Math.abs(points);
    }
  });

  return {totalGranted, totalRedeemed};
});