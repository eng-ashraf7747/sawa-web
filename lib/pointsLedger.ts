// C:\sawa-web\lib\pointsLedger.ts

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import {
  PointsLedgerEntry,
  AddPointsEntryInput,
  POINTS_MONETARY_VALUE,
  ANALYTICS_COLLECTIONS,
} from "@/types/analytics";

const ledgerRef = () => collection(db, ANALYTICS_COLLECTIONS.POINTS_LEDGER);

function toEntry(id: string, data: any): PointsLedgerEntry {
  return {
    id,
    userId: data.userId,
    type: data.type,
    source: data.source,
    points: data.points,
    monetaryValue: data.monetaryValue ?? 0,
    balanceBefore: data.balanceBefore ?? 0,
    balanceAfter: data.balanceAfter ?? 0,
    relatedEntityId: data.relatedEntityId ?? null,
    relatedEntityType: data.relatedEntityType ?? null,
    expiryDate: data.expiryDate
      ? (data.expiryDate as Timestamp).toDate()
      : null,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}

// ─── إضافة سطر جديد في دفتر النقاط ──────────────────────
export async function addPointsEntry(
  input: AddPointsEntryInput
): Promise <string> {
  const balanceBefore = input.currentBalance;
  const balanceAfter =
    input.type === "earned"
      ? balanceBefore + input.points
      : balanceBefore - input.points;

  const docRef = await addDoc(ledgerRef(), {
    userId: input.userId,
    type: input.type,
    source: input.source,
    points: input.type === "earned" ? input.points : -input.points,
    monetaryValue: input.points * POINTS_MONETARY_VALUE,
    balanceBefore,
    balanceAfter,
    relatedEntityId: input.relatedEntityId ?? null,
    relatedEntityType: input.relatedEntityType ?? null,
    expiryDate: input.expiryDate ?? null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// ─── جلب تاريخ نقاط مستخدم (مع فلتر زمني اختياري) ──────
export async function getUserPointsHistory(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise <PointsLedgerEntry[]> {
  try {
    const constraints: QueryConstraint[] = [
      where("userId", "==", userId),
      ...(startDate
        ? [where("createdAt", ">=", Timestamp.fromDate(startDate))]
        : []),
      ...(endDate
        ? [where("createdAt", "<=", Timestamp.fromDate(endDate))]
        : []),
      orderBy("createdAt", "desc"),
    ];
    const q = query(ledgerRef(), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => toEntry(d.id, d.data()));
  } catch {
    return [];
  }
}

// ─── جلب إجمالي النقاط الممنوحة في فترة ─────────────────
export async function getTotalPointsGranted(
  startDate: Date,
  endDate: Date
): Promise <number> {
  try {
    const q = query(
      ledgerRef(),
      where("type", "==", "earned"),
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate))
    );
    const snap = await getDocs(q);
    return snap.docs.reduce((sum, d) => sum + (d.data().points ?? 0), 0);
  } catch {
    return 0;
  }
}

// ─── جلب إجمالي النقاط المستخدمة في فترة ────────────────
export async function getTotalPointsRedeemed(
  startDate: Date,
  endDate: Date
): Promise <number> {
  try {
    const q = query(
      ledgerRef(),
      where("type", "==", "redeemed"),
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate))
    );
    const snap = await getDocs(q);
    return snap.docs.reduce(
      (sum, d) => sum + Math.abs(d.data().points ?? 0),
      0
    );
  } catch {
    return 0;
  }
}

// ─── جلب ملخص نقاط مستخدم في فترة ───────────────────────
export async function getUserPointsSummary(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise <{ earned: number; redeemed: number; net: number }> {
  try {
    const history = await getUserPointsHistory(userId, startDate, endDate);
    const earned = history
      .filter((e) => e.type === "earned")
      .reduce((sum, e) => sum + e.points, 0);
    const redeemed = history
      .filter((e) => e.type === "redeemed")
      .reduce((sum, e) => sum + Math.abs(e.points), 0);
    return { earned, redeemed, net: earned - redeemed };
  } catch {
    return { earned: 0, redeemed: 0, net: 0 };
  }
}