// C:\sawa-web\hooks\useVendorProfileEdit.ts

"use client";

import { useState } from "react";
import { UpdateVendorProfileInput } from "@/types/vendorProfile";
import { saveVendorProfile } from "@/lib/vendorProfile";

interface UseVendorProfileEditReturn {
  saving: boolean;
  error: string | null;
  success: boolean;
  save: (vendorId: string, input: UpdateVendorProfileInput) => Promise<void>;
  reset: () => void;
}

export const useVendorProfileEdit = (): UseVendorProfileEditReturn => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const save = async (
    vendorId: string,
    input: UpdateVendorProfileInput
  ): Promise<void> => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await saveVendorProfile(vendorId, input);
      setSuccess(true);
    } catch (err) {
      console.error("خطأ في حفظ بيانات المورد:", err);
      setError("حدث خطأ في الحفظ — حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { saving, error, success, save, reset };
};