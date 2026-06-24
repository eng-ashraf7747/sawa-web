// C:\sawa-web\lib\users.ts

import {
  collection,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";

const COLLECTION = "users";

// ─── Stream All Users ─────────────────────────────────────
export const streamAllUsers = (
  callback: (users: User[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ ...d.data() } as User)));
    },
    onError
  );
};

// ─── Update User Role ─────────────────────────────────────
export const updateUserRole = async (
  uid: string,
  role: "user" | "vendor" | "admin"
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, uid), {
    role,
    updatedAt: serverTimestamp(),
  });
};