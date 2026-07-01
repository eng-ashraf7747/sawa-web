// C:\sawa-web\components\admin\CategoryForm.tsx

"use client";

import { useState } from "react";
import { CreateCategoryInput } from "@/types/category";
import { useAsyncAction } from "@/hooks/useAsyncAction";

const EMOJI_SUGGESTIONS = [
  "🛒", "🏥", "📚", "💊", "🍎", "🥩", "👗", "💻",
  "📱", "🏠", "🚗", "✂️", "🎓", "🍕", "☕", "🎁",
  "🔧", "💄", "🧹", "🌿", "🏋️", "🎨", "✈️", "🐾",
];

interface CategoryFormProps {
  initialValues?: Partial<CreateCategoryInput>;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export default function CategoryForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "إضافة",
}: CategoryFormProps) {
  const { run, loading } = useAsyncAction();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [emoji, setEmoji] = useState(initialValues?.emoji ?? "🛒");
  const [subtitle, setSubtitle] = useState(initialValues?.subtitle ?? "");
  const [order, setOrder] = useState(initialValues?.order ?? 1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("اسم الفئة مطلوب"); return; }
    if (!emoji.trim()) { setError("الإيقونة مطلوبة"); return; }
    if (!subtitle.trim()) { setError("النص التعريفي مطلوب"); return; }

    setError(null);
    await run(async () => {
      try {
        await onSubmit({
          name: name.trim(),
          emoji: emoji.trim(),
          subtitle: subtitle.trim(),
          order,
          isActive: initialValues?.isActive ?? false,
        });
      } catch {
        setError("حدث خطأ — حاول مرة أخرى");
      }
    });
  };

  return (
    <div className="space-y-5">

      {/* ─── اسم الفئة ───────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          اسم الفئة <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: حسومات السوبر ماركت"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition"
        />
      </div>

      {/* ─── النص التعريفي ───────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          النص التعريفي <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="مثال: خصم يصل لـ 35%"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#1a3c6e] focus:ring-1 focus:ring-[#1a3c6e] transition"
        />
      </div>

      {/* ─── الإيقونة ─────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          الإيقونة <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl border border-slate-200">
            {emoji}
          </div>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="أدخل emoji"
            className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-center text-xl focus:outline-none focus:border-[#1a3c6e] transition"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {EMOJI_SUGGESTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition
                ${emoji === e
                  ? "bg-[#1a3c6e]/10 border-2 border-[#1a3c6e]"
                  : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* ─── الترتيب ──────────────────────────────────────── */}
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