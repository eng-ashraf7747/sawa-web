// C:\sawa-web\lib\commissionLedger.ts

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

const COLLECTION = "commission_ledger";
const ledgerRef = () => collection(db, COLLECTION);

// ─── أنواع العمولة ─────────────────────────────────────────
export type CommissionStatus = "pending" | "paid" | "waived";

export interface CommissionEntry {
  id: string;
  bookingId: string;
  userId: string;
  vendorId: string;
  categoryId: string;
  dealId: string;
  dealTitle: string;
  invoiceValue: number;
  commissionRate: number;
  commissionDue: number;
  commissionCap: number;
  status: CommissionStatus;
  createdAt: Date;
  paidAt: Date | null;
}

export interface AddCommissionEntryInput {
  bookingId: string;
  userId: string;
  vendorId: string;
  categoryId: string;
  dealId: string;
  dealTitle: string;
  invoiceValue: number;
  commissionRate: number;
  commissionCap: number;
}

function toEntry(id: string, data: any): CommissionEntry {
  return {
    id,
    bookingId: data.bookingId,
    userId: data.userId,
    vendorId: data.vendorId,
    categoryId: data.categoryId ?? "",
    dealId: data.dealId ?? "",
    dealTitle: data.dealTitle ?? "",
    invoiceValue: data.invoiceValue ?? 0,
    commissionRate: data.commissionRate ?? 0.02,
    commissionDue: data.commissionDue ?? 0,
    commissionCap: data.commissionCap ?? 50,
    status: data.status ?? "pending",
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    paidAt: data.paidAt ? (data.paidAt as Timestamp).toDate() : null,
  };
}

// ─── تسجيل عمولة جديدة ─────────────────────────────────────
export async function addCommissionEntry(
  input: AddCommissionEntryInput
): Promise <string> {
  const commissionDue = Math.min(
    input.invoiceValue * input.commissionRate,
    input.commissionCap
  );

  const docRef = await addDoc(ledgerRef(), {
    bookingId: input.bookingId,
    userId: input.userId,
    vendorId: input.vendorId,
    categoryId: input.categoryId,
    dealId: input.dealId,
    dealTitle: input.dealTitle,
    invoiceValue: input.invoiceValue,
    commissionRate: input.commissionRate,
    commissionDue,
    commissionCap: input.commissionCap,
    status: "pending" as CommissionStatus,
    createdAt: serverTimestamp(),
    paidAt: null,
  });

  return docRef.id;
}

// ─── جلب عمولات في فترة زمنية ─────────────────────────────────
export async function getCommissions(
  startDate: Date,
  endDate: Date,
  vendorId?: string
): Promise <CommissionEntry[]> {
  try {
    const constraints: QueryConstraint[] = [
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate)),
      ...(vendorId ? [where("vendorId", "==", vendorId)] : []),
      orderBy("createdAt", "desc"),
    ];
    const q = query(ledgerRef(), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => toEntry(d.id, d.data()));
  } catch {
    return [];
  }
}

// ─── إجمالي العمولات المستحقة في فترة ─────────────────────────
export async function getTotalCommissionDue(
  startDate: Date,
  endDate: Date
): Promise <number> {
  try {
    const entries = await getCommissions(startDate, endDate);
    return entries.reduce((sum, e) => sum + e.commissionDue, 0);
  } catch {
    return 0;
  }
}

// ─── إجمالي عمولات مورد في فترة ─────────────────────────────────
export async function getVendorCommissions(
  vendorId: string,
  startDate: Date,
  endDate: Date
): Promise <{ total: number; count: number }> {
  try {
    const entries = await getCommissions(startDate, endDate, vendorId);
    return {
      total: entries.reduce((sum, e) => sum + e.commissionDue, 0),
      count: entries.length,
    };
  } catch {
    return { total: 0, count: 0 };
  }
}