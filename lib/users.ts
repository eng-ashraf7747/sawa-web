// C:\sawa-web\lib\users.ts
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import {
  UpdateUserProfileInput,
  validateProfileInput, // ⚠️ تُرجع string: فارغة/null إذا صحيحة، أو رسالة خطأ
} from "@/lib/profileValidation";

const COLLECTION = "users";
const VALID_ROLES = ["user", "vendor", "admin"] as const;
type Role = (typeof VALID_ROLES)[number];

// ─── Stream All Users ─────────────────────────────
export const streamAllUsers = (
  callback: (users: User[]) => void,
  onError: (error: Error) => void,
  pageSize = 200 // حد أقصى لتفادي جلب آلاف الوثائق دفعة واحدة عبر listener حي
) => {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((d) => {
        const data = d.data();
        // uid من document ID هو المصدر الموثوق، وليس أي حقل داخلي مكرر قد يكون ناقصاً
        return { uid: d.id, ...data } as User;
      });
      callback(users);
    },
    (error) => {
      console.error("streamAllUsers error:", error);
      onError(error);
    }
  );
};

// ─── Get Single User (لعرض بيانات تواصل المشتري في كارت الحجز) ─────
// جلب لمرة واحدة (وليس اشتراكاً حياً) — يُستخدم في سياقات محدودة
// (كارت حجز واحد)، بخلاف streamAllUsers المخصصة لشاشات الأدمن الجماعية
export const getUser = async (uid: string): Promise<User | null> => {
  if (!uid) return null;
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as User;
};

// ─── Update User Role ─────────────────────────────
export const updateUserRole = async (
  uid: string,
  role: Role
): Promise<void> => {
  if (!uid) {
    throw new Error("uid is required");
  }
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  try {
    await updateDoc(doc(db, COLLECTION, uid), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`updateUserRole failed for uid=${uid}:`, error);
    throw error; // نعيد رمي الخطأ ليتعامل معه الـ caller (toast/UI)
  }
};

// ─── Update User Profile (self-service — حقول محدودة صراحةً) ─────────────────────────────
export const updateUserProfile = async (
  uid: string,
  input: UpdateUserProfileInput & { photoURL?: string | null }
): Promise<void> => {
  if (!uid) {
    throw new Error("uid is required");
  }

  const errorMessage = validateProfileInput(input);
  if (errorMessage) {
    throw new Error(errorMessage);
  }

  try {
    await updateDoc(doc(db, COLLECTION, uid), {
      displayName: input.displayName,
      phone: input.phone,
      city: input.city,
      address: input.address ?? null,
      gender: input.gender ?? null,
      age: input.age ?? null,
      photoURL: input.photoURL ?? null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`updateUserProfile failed for uid=${uid}:`, error);
    throw error;
  }
};