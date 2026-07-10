// C:\sawa-web\hooks\useUpdateProfile.ts

"use client";

import { useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { updateUserProfile } from "@/lib/users";
import { uploadImage, deleteImage } from "@/lib/storage";
import {
  UpdateUserProfileInput,
  validateProfileInput,
  validateProfileImage,
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
        const imageError = validateProfileImage(input.photoFile);
        if (imageError) {
          throw new Error(imageError);
        }

        setUploading(true);
        setProgress(0);

        try {
          const timestamp = Date.now();
          const safeFileName = input.photoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const path = `profile-images/${userData.uid}/${timestamp}-${safeFileName}`;

          photoURL = await uploadImage(input.photoFile, path, (prog) =>
            setProgress(Math.round(prog))
          );
          uploadedNewPhoto = true;
        } catch (uploadErr) {
          console.error("Image upload failed:", uploadErr);
          throw new Error("فشل رفع الصورة. تأكد من حجم الملف (≤ 2MB) وحاول مرة أخرى.");
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

      let succeeded = false;

      await run(async () => {
        await updateUserProfile(userData.uid, safeUpdateData);
        succeeded = true;
      });

      // تنظيف الصورة القديمة من Storage بعد نجاح الحفظ فقط، وبشكل غير حاجب (best-effort)
      if (succeeded && uploadedNewPhoto && previousPhotoURL) {
        deleteImage(previousPhotoURL).catch(() => {
          // فشل حذف الصورة القديمة مش لازم يكسر تجربة المستخدم أو يظهر كخطأ له
        });
      }

      return succeeded;
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