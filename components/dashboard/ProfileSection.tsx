// C:\sawa-web\components\dashboard\ProfileSection.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/hooks/useUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useCities } from "@/hooks/useCities";
import { ALLOWED_PROFILE_IMAGE_TYPES } from "@/lib/profileValidation";

const LockIcon = () => <span aria-hidden="true">🔒</span>;
const CameraIcon = () => <span aria-hidden="true">📷</span>;
const HomeIcon = () => <span aria-hidden="true">🏠</span>;
const GenderIcon = () => <span aria-hidden="true">⚤</span>;
const AgeIcon = () => <span aria-hidden="true">📅</span>;

interface ProfileFormState {
  displayName: string;
  phone: string;
  city: string;
  address: string;
  gender: "" | "male" | "female";
  age: string;
}

const EMPTY_FORM: ProfileFormState = {
  displayName: "",
  phone: "",
  city: "fayoum",
  address: "",
  gender: "",
  age: "",
};

function formatMemberSince(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
  });
}

export default function ProfileSection() {
  const { userData, loading } = useUser();
  const { cities } = useCities();
  const {
    updateProfile,
    uploading,
    error,
    clearError,
    progress,
    isLoading: hookLoading,
  } = useUpdateProfile();

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [formData, setFormData] = useState<ProfileFormState>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const syncFormFromUserData = () => {
    if (!userData) return;
    setFormData({
      displayName: userData.displayName || "",
      phone: userData.phone || "",
      city: userData.city || "fayoum",
      address: userData.address || "",
      gender: userData.gender || "",
      age: userData.age ? String(userData.age) : "",
    });
    setPreviewUrl(userData.photoURL || null);
  };

  useEffect(() => {
    syncFormFromUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const handleInputChange = <K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!userData) return;

    setSaving(true);
    setLocalError(null);
    clearError();

    try {
      const success = await updateProfile({
        displayName: formData.displayName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address || undefined,
        gender: formData.gender || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        photoFile: selectedFile || undefined,
      });

      if (success) {
        setMode("view");
        setSelectedFile(null);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "حدث خطأ غير متوقع، حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    syncFormFromUserData();
    setSelectedFile(null);
    setMode("view");
    setLocalError(null);
    clearError();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return <div className="py-12 text-center text-slate-400 text-sm">تعذر تحميل بيانات المستخدم</div>;
  }

  const isBusy = saving || uploading || hookLoading;
  const displayError = error || localError;
  const acceptAttr = ALLOWED_PROFILE_IMAGE_TYPES.join(",");

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-6 lg:p-8" dir="rtl">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
        <h2 className="text-lg md:text-xl font-bold text-[#0f172a]">بياناتي الشخصية</h2>
        {mode === "view" && (
          <button
            onClick={() => setMode("edit")}
            className="text-[#1a3c6e] hover:text-[#c9a84c] font-medium flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e] rounded-lg"
          >
            ✏️ تعديل
          </button>
        )}
      </div>

      {userData.createdAt && (
        <p className="text-xs text-slate-400 mb-6">
          عضو منذ {formatMemberSince(userData.createdAt)}
        </p>
      )}

      {/* الصورة الشخصية */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-slate-100">
            {previewUrl ? (
              <img src={previewUrl} alt="الصورة الشخصية" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl md:text-6xl text-slate-300">👤</div>
            )}
          </div>

          {mode === "edit" && (
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="تغيير الصورة الشخصية"
              className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow hover:bg-[#c9a84c] hover:text-white border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
            >
              <CameraIcon />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttr}
            className="hidden"
            onChange={handleFileSelect}
            aria-label="اختيار صورة شخصية جديدة"
          />
        </div>

        {uploading && (
          <div className="mt-3 text-xs text-slate-500" role="status">
            جاري رفع الصورة... {progress}%
          </div>
        )}
      </div>

      {displayError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm" role="alert">
          {displayError}
        </div>
      )}

      <div className="space-y-6">
        {/* البريد الإلكتروني — ثابت */}
        <div>
          <label className="text-sm font-semibold text-slate-500 mb-1 block">البريد الإلكتروني</label>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-slate-500">
            <LockIcon />
            <span className="truncate">{userData.email}</span>
          </div>
        </div>

        {/* الاسم */}
        <div>
          <label htmlFor="profile-name" className="text-sm font-semibold text-slate-500 mb-1.5 block">
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <input
            id="profile-name"
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange("displayName", e.target.value)}
            disabled={mode === "view"}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 disabled:bg-slate-50 focus:outline-none focus:border-[#1a3c6e]"
          />
        </div>

        {/* التليفون */}
        <div>
          <label htmlFor="profile-phone" className="text-sm font-semibold text-slate-500 mb-1.5 block">
            رقم الجوال <span className="text-red-500">*</span>
          </label>
          <input
            id="profile-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            disabled={mode === "view"}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 disabled:bg-slate-50 focus:outline-none focus:border-[#1a3c6e]"
          />
        </div>

        {/* المدينة */}
        <div>
          <label htmlFor="profile-city" className="text-sm font-semibold text-slate-500 mb-1.5 block">
            المدينة <span className="text-red-500">*</span>
          </label>
          <select
            id="profile-city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            disabled={mode === "view"}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 disabled:bg-slate-50 focus:outline-none focus:border-[#1a3c6e]"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id} disabled={!c.available}>
                {c.nameAr}{!c.available ? " (قريباً)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* البيانات الاختيارية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="profile-address" className="text-sm font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <HomeIcon /> العنوان
            </label>
            <input
              id="profile-address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={mode === "view"}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 disabled:bg-slate-50 focus:outline-none focus:border-[#1a3c6e]"
              placeholder="العنوان التفصيلي"
            />
          </div>

          <div>
            <label htmlFor="profile-gender" className="text-sm font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <GenderIcon /> النوع
            </label>
            <select
              id="profile-gender"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value as ProfileFormState["gender"])}
              disabled={mode === "view"}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 disabled:bg-slate-50 focus:outline-none focus:border-[#1a3c6e]"
            >
              <option value="">اختر</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          <div>
            <label htmlFor="profile-age" className="text-sm font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <AgeIcon /> السن
            </label>
            <input
              id="profile-age"
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              disabled={mode === "view"}
              min={12}
              max={100}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 disabled:bg-slate-50 focus:outline-none focus:border-[#1a3c6e]"
            />
          </div>
        </div>
      </div>

      {mode === "edit" && (
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={isBusy}
            className="flex-1 bg-[#1a3c6e] text-white py-3.5 rounded-2xl font-semibold disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a84c]"
          >
            {isBusy ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isBusy}
            className="flex-1 border border-slate-300 py-3.5 rounded-2xl font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
          >
            إلغاء
          </button>
        </div>
      )}
    </div>
  );
}