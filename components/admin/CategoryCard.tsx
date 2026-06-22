// C:\sawa-web\components\admin\CategoryCard.tsx

"use client";

import { useState } from "react";
import { Category } from "@/types/category";
import { toggleCategoryActive, deleteCategory } from "@/lib/categories";

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
}

export default function CategoryCard({ category, onEdit }: CategoryCardProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleCategoryActive(category.id, category.isActive);
    } catch {
      console.error("خطأ في تغيير حالة الفئة");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`هل تريد حذف فئة "${category.name}" نهائياً؟`)) return;
    setDeleting(true);
    try {
      await deleteCategory(category.id);
    } catch {
      console.error("خطأ في حذف الفئة");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`
      relative bg-white rounded-xl p-5 shadow-sm border-2 transition-all duration-200
      ${category.isActive ? "border-green-400" : "border-slate-100"}
    `}>

      {/* ─── Badge ───────────────────────────────────────── */}
      <div className={`
        absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full
        ${category.isActive
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-400"
        }
      `}>
        {category.isActive ? "نشط" : "معطل"}
      </div>

      {/* ─── Emoji + Info ─────────────────────────────────── */}
      <div className="flex flex-col items-center text-center mb-4 mt-3">
        <span className="text-4xl mb-2">{category.emoji}</span>
        <h3 className="text-sm font-bold text-slate-800">{category.name}</h3>
        <p className="text-xs text-[#c9a84c] font-medium mt-0.5">{category.subtitle}</p>
        <p className="text-[10px] text-slate-400 mt-1">ترتيب: {category.order}</p>
      </div>

      {/* ─── Actions ──────────────────────────────────────── */}
      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`
            flex-1 text-xs font-medium py-2 rounded-lg transition-all disabled:opacity-50
            ${category.isActive
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-green-50 text-green-600 hover:bg-green-100"
            }
          `}
        >
          {toggling ? "..." : category.isActive ? "تعطيل" : "تفعيل"}
        </button>

        <button
          onClick={() => onEdit(category)}
          className="flex-1 text-xs font-medium py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
        >
          تعديل
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-all disabled:opacity-50"
        >
          {deleting ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}