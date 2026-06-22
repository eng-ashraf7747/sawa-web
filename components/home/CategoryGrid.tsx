// C:\sawa-web\components\home\CategoryGrid.tsx

"use client";

import { useActiveCategories } from "@/hooks/useCategories";
import { Category } from "@/types/category";

// ─── Category Card ─────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e8eaed] shadow-sm hover:shadow-md hover:border-[#c9a84c] transition-all duration-200 cursor-pointer group">
      <div className="flex flex-col items-center text-center">
        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
          {category.emoji}
        </span>
        <h3 className="text-[#1a1a2e] font-bold text-sm mb-1">
          {category.name}
        </h3>
        <p className="text-[#c9a84c] text-sm font-semibold">
          {category.subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── Category Grid ─────────────────────────────────────────
export default function CategoryGrid() {
  const { categories, loading, error } = useActiveCategories();

  if (loading) {
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#1a3c6e] text-lg font-extrabold">الفئات المتاحة</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#e8eaed] animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3" />
                <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-2 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">🏷️</span>
        <p className="text-[#6b7280] text-sm">لا توجد فئات متاحة حالياً</p>
        <p className="text-[#c9a84c] text-xs mt-1">سيتم إضافة عروض قريباً</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[#1a3c6e] text-lg font-extrabold">الفئات المتاحة</h2>
        <span className="bg-[#c9a84c] text-white text-xs font-bold px-3 py-1 rounded-full">
          {categories.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}