// C:\sawa-web\lib\categories.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

const COLLECTION = "categories";
const categoriesRef = () => collection(db, COLLECTION);

// ─── Add Category ─────────────────────────────────────────
export const addCategory = async (input: CreateCategoryInput): Promise<string> => {
  const docRef = await addDoc(categoriesRef(), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ─── Update Category ──────────────────────────────────────
export const updateCategory = async (
  id: string,
  input: UpdateCategoryInput
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
};

// ─── Delete Category ──────────────────────────────────────
export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// ─── Toggle Active ────────────────────────────────────────
export const toggleCategoryActive = async (
  id: string,
  current: boolean
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    isActive: !current,
    updatedAt: serverTimestamp(),
  });
};

// ─── Get All Categories (Admin) ───────────────────────────
export const getAllCategories = async (): Promise<Category[]> => {
  const q = query(categoriesRef(), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
};

// ─── Get Active Categories (User) ────────────────────────
export const getActiveCategories = async (): Promise<Category[]> => {
  const q = query(
    categoriesRef(),
    where("isActive", "==", true),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
};