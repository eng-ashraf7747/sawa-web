// C:\sawa-web\components\admin\DealForm.tsx

"use client";

import { useState } from "react";
import { CreateDealInput } from "@/types/deal";
import { useVendors } from "@/hooks/useVendors";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface DealFormProps {
  categoryId: string;
  initialValues?: Partial<CreateDealInput>;
  onSubmit: (data: CreateDealInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isVendor?: boolean;
  vendorId?: string;
  vendorName?: string;
}

export default function DealForm({
  categoryId,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "إضافة",
  isVendor = false,
  vendorId,
  vendorName,
}: DealFormProps) {
  const { vendors } = useVendors();
  const { run, loading } = useAsyncAction();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [discount, setDiscount] = useState(initialValues?.discount ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [externalUrl, setExternalUrl] = useState(initialValues?.externalUrl ?? "");
  const [selectedVendorId, setSelectedVendorId] = useState(initialValues?.vendorId ?? "");
  const [order, setOrder] = useState(initialValues?.order ?? 1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) { setError("اسم العرض مطلوب"); return; }
    if (!description.trim()) { setError("الوصف مطلوب"); return; }
    if (!discount.trim()) { setError("الخصم مطلوب"); return; }

    setError(null);

    const selectedVendor = vendors.find((v) => v.uid === selectedVendorId);

    await run(async () => {
      try {
        await onSubmit({
          categoryId,
          vendorId: isVendor ? vendorId ?? null : selectedVendorId || null,
          vendorName: isVendor
            ? vendorName ?? null
            : selectedVendor?.displayName ?? null,
          title: title.trim(),
          description: description.trim(),
          discount: discount.trim(),
          imageUrl: imageUrl || null,
          externalUrl: externalUrl.trim() || null,
          order,
          status: isVendor ? "pending" : (initialValues?.status ?? "active"),
          expiresAt: null,
        });
      } catch {
        setError("حدث خطأ — حاول مرة أخرى");
      }
    });
  };

  return (
    <div className="space-y-4">

      {/* ─── اسم العرض ───────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          اسم العرض <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: عرض بنده"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition"
        />
      </div>

      {/* ─── الوصف ───────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          الوصف <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف مختصر للعرض"
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition resize-none"
        />
      </div>

      {/* ─── الخصم ───────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          الخصم <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          placeholder="مثال: 20% أو توصيل مجاني"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition"
        />
      </div>

      {/* ─── الصورة ──────────────────────────────────────── */}
      <ImageUpload
        currentUrl={imageUrl}
        onUpload={setImageUrl}
        folder="deals"
      />

      {/* ─── رابط خارجي ──────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          رابط خارجي
        </label>
        <input
          type="text"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition"
        />
      </div>

      {/* ─── مقدم الخدمة — للأدمن فقط ───────────────────── */}
      {!isVendor && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            مقدم الخدمة <span className="text-slate-400 text-xs">(اختياري)</span>
          </label>
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition bg-white"
          >
            <option value="">— بدون مورد محدد —</option>
            {vendors.map((v) => (
              <option key={v.uid} value={v.uid}>
                {v.displayName} — {v.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ─── الترتيب — للأدمن فقط ────────────────────────── */}
      {!isVendor && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            الترتيب
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            min={1}
            className="w-24 px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition"
          />
        </div>
      )}

      {/* ─── إشعار للمورد ────────────────────────────────── */}
      {isVendor && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-700 font-medium">
            ⏳ سيتم مراجعة العرض من قبل الأدمن قبل نشره للمستخدمين
          </p>
        </div>
      )}

      {/* ─── Error ────────────────────────────────────────── */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}

      {/* ─── Actions ──────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-[#1a3c6e] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#1a3c6e]/90 disabled:opacity-50 transition"
        >
          {loading ? "جارٍ الحفظ..." : submitLabel}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-slate-100 text-slate-600 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition"
        >
          إلغاء
        </button>
      </div>

    </div>
  );
}