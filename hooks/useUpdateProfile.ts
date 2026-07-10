// C:\sawa-web\hooks\useUpdateProfile.ts

"use client";

import { useState, useCallback } from "react";
import { updateProfile as updateFirebaseAuthProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/hooks/useUser";
import { updateUserProfile } from "@/lib/users";
import { uploadImage, deleteImage } from "@/lib/storage";
import { resizeImage } from "@/lib/imageResize";
import {
  UpdateUserProfileInput,
  validateProfileInput,
  validateSourceImage,
  validateUploadImageSize,
} from "@/lib/profileValidation";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export interface UseUpdateProfileReturn {
  updateProfile: (data: UpdateUserProfileInput & { photoFile?: File }) => Promise<boolean>;
  uploading: boolean;
  error: string | null;
  clearError: () => void;
  progress: number;
  isLoading: boolean;
}

export function useUpdateProfile(): UseUpdateProfileReturn {
  const { userData } = useUser();
  const { run, loading: asyncLoading, error, clearError } = useAsyncAction();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateProfile = useCallback(
    async (input: UpdateUserProfileInput & { photoFile?: File }): Promise<boolean> => {
      if (!userData?.uid) {
        throw new Error("يجب تسجيل الدخول لتعديل البيانات");
      }

      const textValidationError = validateProfileInput(input);
      if (textValidationError) {
        throw new Error(textValidationError);
      }

      const previousPhotoURL = userData.photoURL ?? null;
      let photoURL: string | null = previousPhotoURL;
      let uploadedNewPhoto = false;

      if (input.photoFile) {
        const sourceImageError = validateSourceImage(input.photoFile);
        if (sourceImageError) {
          throw new Error(sourceImageError);
        }

        setUploading(true);
        setProgress(0);

        try {
          const resizedBlob = await resizeImage(input.photoFile);

          const uploadSizeError = validateUploadImageSize(resizedBlob);
          if (uploadSizeError) {
            throw new Error(uploadSizeError);
          }

          const newPhotoPath = `profile-images/${userData.uid}/${Date.now()}.jpg`;
          photoURL = await uploadImage(resizedBlob, newPhotoPath, (prog) =>
            setProgress(Math.round(prog))
          );
          uploadedNewPhoto = true;
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          const message = uploadErr instanceof Error ? uploadErr.message : "فشل رفع الصورة، حاول مرة أخرى";
          throw new Error(message);
        } finally {
          setUploading(false);
          setProgress(0);
        }
      }

      const safeUpdateData: UpdateUserProfileInput & { photoURL?: string | null } = {
        displayName: input.displayName.trim(),
        phone: input.phone.trim(),
        city: input.city.trim(),
        address: input.address?.trim() || undefined,
        gender: input.gender || undefined,
        age: input.age ?? undefined,
        photoURL,
      };

      // ملاحظة معمارية مهمة: run() من useAsyncAction يبتلع الأخطاء داخليًا (لا يرمي تاني) —
      // العلم succeeded هو الطريقة الصحيحة الوحيدة لمعرفة نجاح الكتابة فعليًا من هنا
      let succeeded = false;

      await run(async () => {
        await updateUserProfile(userData.uid, safeUpdateData);
        succeeded = true;
      });

      if (!succeeded) {
        // Rollback: الكتابة فشلت — نمسح الصورة الجديدة اللي اترفعت لمنع تراكم ملفات يتيمة،
        // والصورة القديمة تفضل زي ما هي لأننا ما لمسناهاش خالص
        if (uploadedNewPhoto && photoURL) {
          deleteImage(photoURL).catch(() => {});
        }
        return false;
      }

      // مزامنة Firebase Auth (غير حاجبة — فشلها لا يوقف نجاح الحفظ الأساسي في Firestore)
      if (auth.currentUser) {
        updateFirebaseAuthProfile(auth.currentUser, {
          displayName: safeUpdateData.displayName,
          photoURL: safeUpdateData.photoURL ?? undefined,
        }).catch((authSyncError) => {
          console.warn("Firebase Auth profile sync failed:", authSyncError);
        });
      }

      // تنظيف الصورة القديمة بعد نجاح كل شيء، وبس لو فيه صورة جديدة اتحفظت فعلاً
      if (uploadedNewPhoto && previousPhotoURL) {
        deleteImage(previousPhotoURL).catch(() => {});
      }

      return true;
    },
    [userData, run]
  );

  return {
    updateProfile,
    uploading,
    error,
    clearError,
    progress,
    isLoading: asyncLoading || uploading,
  };
}