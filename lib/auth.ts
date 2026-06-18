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
  getDoc,
  getDocs,
  collection,
  query,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const googleProvider = new GoogleAuthProvider();

// ─── توليد كود إحالة ──────────────────────────────────────────
const generateReferralCode = (uid: string): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  let seed = Math.abs(
    uid.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );
  for (let i = 0; i < 6; i++) {
    code += chars[seed % chars.length];
    seed = Math.floor(seed / chars.length) || seed * 31 + i;
  }
  return code;
};

// ─── التحقق من تكرار رقم الهاتف ──────────────────────────────
const checkPhoneExists = async (phone: string): Promise<boolean> => {
  const q = query(
    collection(db, "users"),
    where("phone", "==", phone),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// ─── حفظ بيانات المستخدم في Firestore ────────────────────────
const saveUserToFirestore = async (
  user: User,
  extra?: {
    displayName?: string;
    phone?: string;
    referralCode?: string;
  }
) => {
  const userRef = doc(db, "users", user.uid);
  const existing = await getDoc(userRef);
  if (existing.exists()) return;

  await setDoc(userRef, {
    uid: user.uid,
    displayName: extra?.displayName || user.displayName || "",
    email: user.email || "",
    phone: extra?.phone || null,
    photoUrl: user.photoURL || null,
    city: "fayoum",
    address: null,
    role: "user",
    tier: "bronze",
    points: 25,
    referralCode: generateReferralCode(user.uid),
    referredBy: extra?.referralCode || null,
    emailVerified: false,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
  // التحقق من تكرار رقم الهاتف
  const phoneExists = await checkPhoneExists(phone);
  if (phoneExists) {
    throw { code: "phone-already-in-use" };
  }

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