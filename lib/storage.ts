// C:\sawa-web\lib\storage.ts

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const storage = getStorage();

// ─── رفع صورة ─────────────────────────────────────────────
export const uploadImage = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

// ─── حذف صورة ─────────────────────────────────────────────
export const deleteImage = async (url: string): Promise<void> => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // الصورة غير موجودة — لا نوقف التطبيق
    console.warn("لم يتم العثور على الصورة للحذف");
  }
};