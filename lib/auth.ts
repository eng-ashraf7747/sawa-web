// C:\sawa-web\lib\auth.ts

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import {
  trackEvent,
  captureTrafficSource,
  getSavedSource,
} from "@/lib/analytics";
import { addPointsEntry } from "@/lib/pointsLedger";

const googleProvider = new GoogleAuthProvider();

// ─── ثوابت النقاط ────────────────────────────────────────────
const SIGNUP_BONUS_POINTS = 25;

// ─── حفظ مستخدم جديد بالإيميل ────────────────────────────────
const saveNewEmailUser = async (
  user: User,
  extra: {
    displayName: string;
    phone: string;
    referralCode?: string;
  }
) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    displayName: extra.displayName,
    email: user.email || "",
    phone: extra.phone,
    photoUrl: null,
    city: "fayoum",
    address: null,
    role: "user",
    tier: "bronze",
    points: SIGNUP_BONUS_POINTS,
    referredBy: extra.referralCode || null,
    registrationSource: getSavedSource(),
    emailVerified: false,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// ─── حفظ مستخدم Google ────────────────────────────────────────
const saveGoogleUser = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    displayName: user.displayName || "",
    email: user.email || "",
    phone: null,
    photoUrl: user.photoURL || null,
    city: "fayoum",
    address: null,
    tier: "bronze",
    points: SIGNUP_BONUS_POINTS,
    registrationSource: getSavedSource(),
    emailVerified: true,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// ─── Login ────────────────────────────────────────────────────
export const loginWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  await trackEvent({
    eventType: "user_logged_in",
    userId: credential.user.uid,
    metadata: { method: "email" },
  });

  return credential;
};

// ─── Register ─────────────────────────────────────────────────
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  phone: string,
  referralCode?: string
) => {
  captureTrafficSource();

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
  await saveNewEmailUser(credential.user, { displayName, phone, referralCode });

  await addPointsEntry({
    userId: credential.user.uid,
    type: "earned",
    source: "registration",
    points: SIGNUP_BONUS_POINTS,
    currentBalance: 0,
    relatedEntityId: null,
    relatedEntityType: null,
  });

  await trackEvent({
    eventType: "user_registered",
    userId: credential.user.uid,
    pointsChange: SIGNUP_BONUS_POINTS,
    metadata: {
      method: "email",
      hasReferral: !!referralCode,
      referralCode: referralCode ?? null,
    },
  });

  if (referralCode) {
    await trackEvent({
      eventType: "user_used_referral",
      userId: credential.user.uid,
      metadata: { referralCode },
    });
  }

  return credential;
};

// ─── Google Sign-In ───────────────────────────────────────────
export const loginWithGoogle = async () => {
  captureTrafficSource();

  const credential = await signInWithPopup(auth, googleProvider);
  await saveGoogleUser(credential.user);

  await addPointsEntry({
    userId: credential.user.uid,
    type: "earned",
    source: "registration",
    points: SIGNUP_BONUS_POINTS,
    currentBalance: 0,
    relatedEntityId: null,
    relatedEntityType: null,
  });

  await trackEvent({
    eventType: "user_logged_in",
    userId: credential.user.uid,
    pointsChange: SIGNUP_BONUS_POINTS,
    metadata: { method: "google" },
  });

  return credential;
};

// ─── Forgot Password ──────────────────────────────────────────
export const forgotPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

// ─── Logout ───────────────────────────────────────────────────
export const logout = () => signOut(auth);