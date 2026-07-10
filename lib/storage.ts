// C:\sawa-web\lib\storage.ts

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const storage = getStorage();

interface StorageErrorLike {
  code?: string;
  message?: string;
}

// ─── تنظيف مسار الرفع دفاعيًا (Defense in Depth — مستقل عن سلوك أي Caller) ───
const sanitizePath = (path: string): string => {
  if (!path || typeof path !== "string") {
    throw new Error("مسار الرفع مطلوب");
  }
  const sanitized = path.trim().replace(/^\/+|\/+$/g, "");
  if (sanitized.includes("..") || sanitized.includes("//")) {
    throw new Error("مسار غير صالح");
  }
  return sanitized;
};

// ─── رفع صورة (تدعم File أو Blob — الأخيرة ناتجة مثلاً عن تصغير الصورة قبل الرفع) ───
export const uploadImage = async (
  file: File | Blob,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!file || file.size === 0) {
    throw new Error("الملف فارغ، تعذر رفعه");
  }

  const safePath = sanitizePath(path);
  const storageRef = ref(storage, safePath);

  const metadata = {
    cacheControl: "public, max-age=604800", // 7 أيام
    contentType: file.type || "application/octet-stream",
    customMetadata: {
      uploadedAt: new Date().toISOString(),
    },
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = snapshot.totalBytes > 0
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        onProgress?.(progress);
      },
      (error: StorageErrorLike) => {
        console.error(`uploadImage failed for path=${safePath}:`, error);
        const wrappedError = new Error(`فشل رفع الملف: ${error.message || "خطأ غير معروف"}`) as Error & { code?: string };
        wrappedError.code = error.code;
        reject(wrappedError);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (error) {
          console.error(`getDownloadURL failed for path=${safePath}:`, error);
          reject(error);
        }
      }
    );
  });
};

// ─── حذف صورة (عملية تنظيف غير حاجبة — فشلها لا يجب أن يكسر أي تجربة مستخدم) ───
export const deleteImage = async (url: string): Promise<void> => {
  if (!url) return;

  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error: unknown) {
    const errorCode = (error as StorageErrorLike)?.code;

    if (errorCode === "storage/object-not-found") {
      return; // متوقع وغير خطير، لا داعي لأي تسجيل
    }

    console.warn(`deleteImage failed for url=${url}:`, error);
    // لا نرمي الخطأ → عملية غير حاجبة (Non-blocking) بتصميم
  }
};