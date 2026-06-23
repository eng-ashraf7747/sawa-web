// C:\sawa-web\lib\deals.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Deal, CreateDealInput, UpdateDealInput } from "@/types/deal";

const COLLECTION = "deals";
const dealsRef = () => collection(db, COLLECTION);

// ─── Add Deal ─────────────────────────────────────────────
export const addDeal = async (input: CreateDealInput): Promise<string> => {
  const docRef = await addDoc(dealsRef(), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ─── Update Deal ──────────────────────────────────────────
export const updateDeal = async (
  id: string,
  input: UpdateDealInput
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
};

// ─── Delete Deal ──────────────────────────────────────────
export const deleteDeal = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// ─── Toggle Active ────────────────────────────────────────
export const toggleDealActive = async (
  id: string,
  current: boolean
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    isActive: !current,
    updatedAt: serverTimestamp(),
  });
};

// ─── Stream Deals by Category (Admin) ────────────────────
export const streamDealsByCategory = (
  categoryId: string,
  callback: (deals: Deal[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    dealsRef(),
    where("categoryId", "==", categoryId),
    orderBy("order", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Deal)));
    },
    onError
  );
};

// ─── Stream Active Deals by Category (User) ──────────────
export const streamActiveDealsByCategory = (
  categoryId: string,
  callback: (deals: Deal[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    dealsRef(),
    where("categoryId", "==", categoryId),
    where("isActive", "==", true),
    orderBy("order", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Deal)));
    },
    onError
  );
};