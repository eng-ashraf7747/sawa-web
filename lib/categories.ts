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
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Subcategory,
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
} from "@/types/category";

const COLLECTION = "categories";
const SUBCOLLECTION = "subcategories";
const categoriesRef = () => collection(db, COLLECTION);
const subcategoriesRef = (categoryId: string) =>
  collection(db, COLLECTION, categoryId, SUBCOLLECTION);

// ─── Add Category ─────────────────────────────────────────
export const addCategory = async (input: CreateCategoryInput): Promise <string> => {
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
): Promise <void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
};

// ─── Delete Category ──────────────────────────────────────
export const deleteCategory = async (id: string): Promise <void> => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// ─── Toggle Active ────────────────────────────────────────
export const toggleCategoryActive = async (
  id: string,
  current: boolean
): Promise <void> => {
  await updateDoc(doc(db, COLLECTION, id), {
    isActive: !current,
    updatedAt: serverTimestamp(),
  });
};

// ─── Get All Categories (Admin) ───────────────────────────
export const getAllCategories = async (): Promise <Category[]> => {
  const q = query(categoriesRef(), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
};

// ─── Get Active Categories (User) ────────────────────────
export const getActiveCategories = async (): Promise <Category[]> => {
  const q = query(
    categoriesRef(),
    where("isActive", "==", true),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
};

// ─── Add Subcategory ──────────────────────────────────────
export const addSubcategory = async (
  input: CreateSubcategoryInput
): Promise <string> => {
  const docRef = await addDoc(subcategoriesRef(input.categoryId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// ─── Update Subcategory ───────────────────────────────────
export const updateSubcategory = async (
  categoryId: string,
  subcategoryId: string,
  input: UpdateSubcategoryInput
): Promise <void> => {
  await updateDoc(
    doc(db, COLLECTION, categoryId, SUBCOLLECTION, subcategoryId),
    { ...input, updatedAt: serverTimestamp() }
  );
};

// ─── Delete Subcategory ───────────────────────────────────
export const deleteSubcategory = async (
  categoryId: string,
  subcategoryId: string
): Promise <void> => {
  await deleteDoc(
    doc(db, COLLECTION, categoryId, SUBCOLLECTION, subcategoryId)
  );
};

// ─── Toggle Subcategory Active ────────────────────────────
export const toggleSubcategoryActive = async (
  categoryId: string,
  subcategoryId: string,
  current: boolean
): Promise <void> => {
  await updateDoc(
    doc(db, COLLECTION, categoryId, SUBCOLLECTION, subcategoryId),
    { isActive: !current, updatedAt: serverTimestamp() }
  );
};

// ─── Get All Subcategories (Admin) ────────────────────────
export const getAllSubcategories = async (
  categoryId: string
): Promise <Subcategory[]> => {
  const q = query(
    subcategoriesRef(categoryId),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  } as Subcategory));
};

// ─── Get Active Subcategories (User/Requests) ─────────────
export const getActiveSubcategories = async (
  categoryId: string
): Promise <Subcategory[]> => {
  const q = query(
    subcategoriesRef(categoryId),
    where("isActive", "==", true),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  } as Subcategory));
};