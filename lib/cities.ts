// C:\sawa-web\lib\cities.ts

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION = "cities";

// ─── Toggle Active ─────────────────────────────────────
export const toggleCityActive = async (
  id: string,
  current: boolean
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    available: !current,
  });
};