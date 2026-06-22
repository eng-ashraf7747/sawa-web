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

const googleProvider = new GoogleAuthProvider();

// ─── حفظ البيانات الأساسية فقط — المنطق في Cloud Functions ───
const saveUserToFirestore = async (
  user: User,
  extra?: {
    displayName?: string;
    phone?: string;
    referralCode?: string;
  }
) => {
  const userRef = doc(db, "users", user.uid);

  await setDoc(userRef, {
    uid: user.uid,
    displayName: extra?.displayName || user.displayName || "",
    email: user.email || "",
    phone: extra?.phone || null,
    photoUrl: user.photoURL || null,
    city: "fayoum",
    address: null,
    tier: "bronze",
    referredBy: extra?.referralCode || null,
    emailVerified: false,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// ─── Login ────────────────────────────────────────────────────
export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// ─── Register ─────────────────────────────────────────────────
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  phone: string,
  referralCode?: string
) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await sendEmailVerification(credential.user);
  await saveUserToFirestore(credential.user, {
    displayName,
    phone,
    referralCode,
  });
  return credential;
};

// ─── Google Sign-In ───────────────────────────────────────────
export const loginWithGoogle = async () => {
  const credential = await signInWithPopup(auth, googleProvider);
  await saveUserToFirestore(credential.user);
  return credential;
};

// ─── Forgot Password ──────────────────────────────────────────
export const forgotPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

// ─── Logout ───────────────────────────────────────────────────
export const logout = () => signOut(auth);