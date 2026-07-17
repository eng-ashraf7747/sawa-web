// C:\sawa-web\hooks\useContactForm.ts

"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { submitContactMessage } from "@/lib/contact";
import {
  ContactMessageMethod,
  ContactMessageCategory,
  ContactMessageSenderType,
} from "@/types/contact";

type ContactModalState = "success" | "cancelConfirm" | null;

interface ContactFormState {
  name: string;
  city: string;
  method: ContactMessageMethod;
  contactValue: string;
  category: ContactMessageCategory;
  message: string;
}

const INITIAL_STATE: ContactFormState = {
  name: "",
  city: "",
  method: "whatsapp",
  contactValue: "",
  category: "general_inquiry",
  message: "",
};

export function useContactForm() {
  const { userData, loading: userLoading } = useUser();
  const { profile: vendorProfile } = useVendorProfile(
    userData?.role === "vendor" ? userData.uid : ""
  );

  const [form, setForm] = useState<ContactFormState>(INITIAL_STATE);
  const [touched, setTouched] = useState(false);
  const [modal, setModal] = useState<ContactModalState>(null);

  const prefilledRef = useRef<string | null>(null);
  const { run, loading: submitting, error, clearError } = useAsyncAction();

  const senderType: ContactMessageSenderType = !userData
    ? "guest"
    : userData.role === "vendor"
    ? "vendor"
    : "user";

  const isNameEditable = senderType === "guest";
  const showCityField = senderType === "guest";
  const isContactValueEditable = senderType === "guest" || form.method === "whatsapp";

  // ─── تعبئة تلقائية آمنة: تنتظر بيانات المورد قبل القفل ──────
  useEffect(() => {
    if (userLoading || !userData) return;
    if (userData.role === "vendor" && !vendorProfile) return;
    if (prefilledRef.current === userData.uid) return;

    prefilledRef.current = userData.uid;

    setForm((prev) => ({
      ...prev,
      name: userData.displayName ?? "",
      method: "whatsapp",
      city: userData.city ?? "",
      contactValue:
        userData.role === "vendor"
          ? vendorProfile?.whatsapp ?? ""
          : userData.phone ?? "",
    }));
  }, [userLoading, userData, vendorProfile]);

  const updateField = <K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K]
  ) => {
    setTouched(true);
    clearError();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setMethod = (method: ContactMessageMethod) => {
    setTouched(true);
    clearError();
    setForm((prev) => ({
      ...prev,
      method,
      contactValue:
        senderType === "guest"
          ? ""
          : method === "email"
          ? userData?.email ?? ""
          : senderType === "vendor"
          ? vendorProfile?.whatsapp ?? ""
          : userData?.phone ?? "",
    }));
  };

  const submit = async () => {
    await run(async () => {
      await submitContactMessage({
        senderType,
        senderId: userData?.uid ?? null,
        name:
          senderType === "guest"
            ? form.name.trim() || null
            : userData?.displayName ?? null,
        city: senderType === "guest" ? form.city || null : null,
        method: form.method,
        contactValue: form.contactValue,
        category: form.category,
        message: form.message,
      });

      setForm(INITIAL_STATE);
      setTouched(false);
      setModal("success");
    });
  };

  const goHome = () => {
    window.location.href = "/";
  };

  const requestCancel = () => {
    if (touched) {
      setModal("cancelConfirm");
    } else {
      goHome();
    }
  };

  const confirmCancel = () => goHome();

  const dismissCancelConfirm = () => setModal(null);

  return {
    senderType,
    form,
    updateField,
    setMethod,
    isNameEditable,
    showCityField,
    isContactValueEditable,
    vendorBadge: senderType === "vendor",
    touched,
    submitting,
    error,
    modal,
    submit,
    requestCancel,
    confirmCancel,
    dismissCancelConfirm,
    goHome,
  };
}