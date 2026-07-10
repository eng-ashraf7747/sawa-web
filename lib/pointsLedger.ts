// C:\sawa-web\lib\pointsLedger.ts

import { db } from "@/lib/firebase";
import {
  collectionGroup,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { POINTS_LEDGER_SUBCOLLECTION } from "@/types/analytics";

// ─── جلب إجمالي النقاط الممنوحة في فترة (عبر كل المستخدمين) ─────────────────
// يستخدم collectionGroup للاستعلام عبر كل الـ Subcollections المسمّاة "pointsLedger"
// تحت كل مستخدم في نفس الوقت — يتطلب فهرس Collection Group واحد في Firestore
// (يظهر رابط إنشائه تلقائيًا في الكونسول أول مرة يُستدعى فيها هذا الاستعلام)
export async function getTotalPointsGranted(
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const q = query(
      collectionGroup(db, POINTS_LEDGER_SUBCOLLECTION),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      where("timestamp", "<=", Timestamp.fromDate(endDate))
    );
    const snap = await getDocs(q);
    return snap.docs.reduce((sum, d) => {
      const points = d.data().points ?? 0;
      return points > 0 ? sum + points : sum;
    }, 0);
  } catch (error) {
    console.error("getTotalPointsGranted error:", error);
    return 0;
  }
}

// ─── جلب إجمالي النقاط المستردة/المخصومة في فترة ─────────────────────────
// ملاحظة: لا يوجد حاليًا أي نوع سطر يمثّل "استرداد" فعليًا في البيانات الحقيقية
// (نظام استبدال النقاط بالاشتراك غير مبني بعد) — الدالة مصمَّمة بشكل عام
// (أي نقاط سالبة، أيًا كان نوعها) لتلتقط أي خصم مستقبلي بدون تعديل لاحق
export async function getTotalPointsRedeemed(
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const q = query(
      collectionGroup(db, POINTS_LEDGER_SUBCOLLECTION),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      where("timestamp", "<=", Timestamp.fromDate(endDate))
    );
    const snap = await getDocs(q);
    return snap.docs.reduce((sum, d) => {
      const points = d.data().points ?? 0;
      return points < 0 ? sum + Math.abs(points) : sum;
    }, 0);
  } catch (error) {
    console.error("getTotalPointsRedeemed error:", error);
    return 0;
  }
}