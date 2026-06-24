// C:\sawa-web\lib\vendor.ts

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction, CreateTransactionInput, Review, CreateReviewInput, VendorStats } from "@/types";

const TRANSACTIONS = "transactions";
const REVIEWS = "reviews";

// ─── Stream Transactions by Vendor ───────────────────────
export const streamVendorTransactions = (
  vendorId: string,
  callback: (transactions: Transaction[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, TRANSACTIONS),
    where("vendorId", "==", vendorId),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)));
    },
    onError
  );
};

// ─── Stream Reviews by Vendor ─────────────────────────────
export const streamVendorReviews = (
  vendorId: string,
  callback: (reviews: Review[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, REVIEWS),
    where("vendorId", "==", vendorId),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
    },
    onError
  );
};

// ─── Calculate Vendor Stats ───────────────────────────────
export const calculateVendorStats = (transactions: Transaction[]): VendorStats => {
  const dealMap = new Map<string, { dealTitle: string; count: number }>();

  transactions.forEach((t) => {
    if (dealMap.has(t.dealId)) {
      dealMap.get(t.dealId)!.count++;
    } else {
      dealMap.set(t.dealId, { dealTitle: t.dealTitle, count: 1 });
    }
  });

  return {
    totalTransactions: transactions.length,
    dealStats: Array.from(dealMap.entries()).map(([dealId, { dealTitle, count }]) => ({
      dealId,
      dealTitle,
      transactionCount: count,
    })),
  };
};

// ─── Add Transaction ──────────────────────────────────────
export const addTransaction = async (input: CreateTransactionInput): Promise<string> => {
  const docRef = await addDoc(collection(db, TRANSACTIONS), {
    ...input,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

// ─── Add Review ───────────────────────────────────────────
export const addReview = async (input: CreateReviewInput): Promise<string> => {
  const docRef = await addDoc(collection(db, REVIEWS), {
    ...input,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};