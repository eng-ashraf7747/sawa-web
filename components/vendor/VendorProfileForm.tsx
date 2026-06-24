// C:\sawa-web\components\vendor\VendorProfileForm.tsx

"use client";

import { useState, useEffect } from "react";
import { VendorProfile, UpdateVendorProfileInput } from "@/types/vendorProfile";

interface VendorProfileFormProps {
  profile: VendorProfile | null;
  onSave: (input: UpdateVendorProfileInput) => Promise<void>;
  saving: boolean;
  error: string | null;
  success: boolean;
}

export default function VendorProfileForm({
  profile,
  onSave,
  saving,
  error,
  success,
}: VendorProfileFormProps) {
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName ?? "");
      setDescription(profile.description ?? "");
      setAddress(profile.address ?? "");
      setMapsUrl(profile.mapsUrl ?? "");
      setPhone(profile.phone ?? "");
      setWhatsapp(profile.whatsapp ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!businessName.trim()) {
      setFormError("الاسم التجاري مطلوب");
      return;
    }
    setFormError(null);
    await onSave({
      businessName: businessName.trim(),
      description: description.trim() || null,
      address: address.trim() || null,
      mapsUrl: mapsUrl.trim() || null,
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
    });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition bg-white";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="space-y-4">

      {/* ─── الاسم التجاري ───────────────────────────────── */}
      <div>
        <label className={labelClass}>
          الاسم التجاري <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="مثال: سوبر ماركت بنده"
          className={inputClass}
        />
      </div>

      {/* ─── وصف النشاط ──────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          وصف النشاط <span className="text-slate-400 text-xs">(اختياري)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف مختصر عن نشاطك التجاري"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ─── العنوان ─────────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          العنوان <span className="text-slate-400 text-xs">(اختياري)</span>
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="مثال: شارع النيل، الفيوم"
          className={inputClass}
        />
      </div>

      {/* ─── رابط Google Maps ────────────────────────────── */}
      <div>
        <label className={labelClass}>
          رابط Google Maps <span className="text-slate-400 text-xs">(اختياري)</span>
        </label>
        <input
          type="text"
          value={mapsUrl}
          onChange={(e) => setMapsUrl(e.target.value)}
          placeholder="https://maps.google.com/..."
          className={inputClass}
        />
        <p className="text-xs text-slate-400 mt-1">
          افتح موقعك على Google Maps ثم انسخ الرابط
        </p>
      </div>

      {/* ─── رقم التليفون ────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          رقم التليفون <span className="text-slate-400 text-xs">(اختياري)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01000000000"
          className={inputClass}
          dir="ltr"
        />
      </div>

      {/* ─── رقم واتساب ──────────────────────────────────── */}
      <div>
        <label className={labelClass}>
          رقم واتساب <span className="text-slate-400 text-xs">(اختياري)</span>
        </label>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="01000000000"
          className={inputClass}
          dir="ltr"
        />
        <p className="text-xs text-slate-400 mt-1">
          أدخل الرقم بدون + أو كود الدولة
        </p>
      </div>

      {/* ─── Error ───────────────────────────────────────── */}
      {(formError || error) && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
          {formError || error}
        </p>
      )}

      {/* ─── Success ─────────────────────────────────────── */}
      {success && (
        <p className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
          ✅ تم حفظ البيانات بنجاح
        </p>
      )}

      {/* ─── Save Button ─────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#1a3c6e] text-white text-sm font-medium py-3 rounded-lg hover:bg-[#1a3c6e]/90 disabled:opacity-50 transition"
      >
        {saving ? "جارٍ الحفظ..." : "حفظ البيانات"}
      </button>

    </div>
  );
}