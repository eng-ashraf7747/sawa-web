// C:\sawa-web\lib\vendorProfile.ts

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VendorProfile, UpdateVendorProfileInput } from "@/types/vendorProfile";

const COLLECTION = "vendorProfiles";

// ─── Get Vendor Profile (one-time) ───────────────────────
export const getVendorProfile = async (
  vendorId: string
): Promise<VendorProfile | null> => {
  const snap = await getDoc(doc(db, COLLECTION, vendorId));
  if (!snap.exists()) return null;
  return { vendorId: snap.id, ...snap.data() } as VendorProfile;
};

// ─── Stream Vendor Profile (real-time) ───────────────────
export const streamVendorProfile = (
  vendorId: string,
  callback: (profile: VendorProfile | null) => void,
  onError: (error: Error) => void
) => {
  return onSnapshot(
    doc(db, COLLECTION, vendorId),
    (snap) => {
      if (snap.exists()) {
        callback({ vendorId: snap.id, ...snap.data() } as VendorProfile);
      } else {
        callback(null);
      }
    },
    onError
  );
};

// ─── Create or Update Vendor Profile ─────────────────────
export const saveVendorProfile = async (
  vendorId: string,
  input: UpdateVendorProfileInput
): Promise<void> => {
  const ref = doc(db, COLLECTION, vendorId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      ...input,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      ...input,
      vendorId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};