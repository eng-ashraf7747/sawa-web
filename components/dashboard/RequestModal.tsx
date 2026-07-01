// C:\sawa-web\components\dashboard\RequestModal.tsx

"use client";

import { useState, useEffect } from "react";
import { useActiveCategories } from "@/hooks/useCategories";
import { getActiveSubcategories } from "@/lib/categories";
import { useRequestActions } from "@/hooks/useRequests";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { Subcategory } from "@/types/category";
import { MAX_REQUESTS_PER_USER } from "@/types/request";

interface Props {
  userId: string;
  userName: string;
  remaining: number;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function RequestModal({
  userId,
  userName,
  remaining,
  onClose,
  onSubmitted,
}: Props) {
  const { categories } = useActiveCategories();
  const { submit, error: submitError } = useRequestActions();
  const { run, loading } = useAsyncAction();

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState <Subcategory[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [validationError, setValidationError] = useState <string | null>(null);

  useEffect(() => {
    if (!selectedCategoryId) {
      setSubcategories([]);
      setSelectedSubcategoryId("");
      setSelectedSubcategoryName("");
      return;
    }
    setLoadingSubs(true);
    getActiveSubcategories(selectedCategoryId)
      .then(setSubcategories)
      .finally(() => setLoadingSubs(false));
  }, [selectedCategoryId]);

  const handleSubmit = async () => {
    setValidationError(null);
    if (!selectedCategoryId) { setValidationError("اختر فئة"); return; }
    if (!selectedSubcategoryId) { setValidationError("اختر فئة فرعية"); return; }
    if (!title.trim()) { setValidationError("اكتب عنوان الطلب"); return; }

    await run(async () => {
      const result = await submit({
        userId,
        userName,
        categoryId: selectedCategoryId,
        categoryName: selectedCategoryName,
        subcategoryId: selectedSubcategoryId,
        subcategoryName: selectedSubcategoryName,
        title: title.trim(),
        description: description.trim(),
      });

      if (result) {
        setIsNew(result.isNew);
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
        dir="rtl"
      >
        <div className="bg-white w-full md:w-[480px] rounded-t-2xl md:rounded-2xl p-6 shadow-xl text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-[#1a3c6e] font-bold text-lg mb-2">
            {isNew ? "تم تسجيل طلبك" : "تم تحديث طلبك"}
          </h2>
          <p className="text-gray-500 text-sm mb-2">
            سوا ستتواصل مع الموردين وتُعلمك عند توفر العرض
          </p>
          <p className="text-[#c9a84c] text-xs font-semibold mb-6">
            لديك {remaining - (isNew ? 1 : 0)} طلبات متبقية من أصل {MAX_REQUESTS_PER_USER}
          </p>
          <button
            onClick={() => { onSubmitted(); onClose(); }}
            className="w-full bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold py-3 rounded-xl transition"
          >
            حسناً
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50"
      dir="rtl"
    >
      <div className="bg-white w-full md:w-[480px] rounded-t-2xl md:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#1a3c6e] font-bold text-lg">سجّل طلبك</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {remaining} طلبات متبقية
          </span>
        </div>

        <p className="text-gray-400 text-xs mb-5">
          أخبرنا بما تحتاجه وسوا ستتواصل مع الموردين لتوفيره
        </p>

        <div className="flex flex-col gap-4">

          <div>
            <label className="text-sm font-semibold text-[#1a3c6e] mb-1 block">
              الفئة الرئيسية
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                const cat = categories.find((c) => c.id === e.target.value);
                setSelectedCategoryId(e.target.value);
                setSelectedCategoryName(cat?.name ?? "");
                setSelectedSubcategoryId("");
                setSelectedSubcategoryName("");
              }}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a3c6e] bg-white"
            >
              <option value="">اختر فئة</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>

          {selectedCategoryId && (
            <div>
              <label className="text-sm font-semibold text-[#1a3c6e] mb-1 block">
                الفئة الفرعية
              </label>
              {loadingSubs ? (
                <div className="flex justify-center py-3">
                  <div className="w-5 h-5 border-2 border-[#1a3c6e] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : subcategories.length === 0 ? (
                <p className="text-gray-400 text-xs py-2">لا توجد فئات فرعية لهذه الفئة بعد</p>
              ) : (
                <select
                  value={selectedSubcategoryId}
                  onChange={(e) => {
                    const sub = subcategories.find((s) => s.id === e.target.value);
                    setSelectedSubcategoryId(e.target.value);
                    setSelectedSubcategoryName(sub?.name ?? "");
                  }}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a3c6e] bg-white"
                >
                  <option value="">اختر فئة فرعية</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-[#1a3c6e] mb-1 block">
              عنوان الطلب
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كتب المرحلة الإعدادية للفصل الدراسي الأول"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a3c6e]"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1a3c6e] mb-1 block">
              تفاصيل إضافية
              <span className="text-gray-400 font-normal mr-1">(اختياري)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أي تفاصيل تساعد الموردين على فهم احتياجك..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-[#1a3c6e]"
              maxLength={300}
            />
          </div>

          {(validationError || submitError) && (
            <p className="text-red-500 text-sm text-center">
              {validationError ?? submitError}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "جاري التسجيل..." : "سجّل طلبي"}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition"
          >
            إلغاء
          </button>

        </div>
      </div>
    </div>
  );
}