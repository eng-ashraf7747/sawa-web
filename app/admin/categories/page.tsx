// C:\sawa-web\app\admin\categories\page.tsx

"use client";

import { useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAllCategories } from "@/hooks/useCategories";
import { addCategory, updateCategory } from "@/lib/categories";
import { Category, CreateCategoryInput } from "@/types/category";
import AdminLayout from "@/components/admin/AdminLayout";
import CategoryCard from "@/components/admin/CategoryCard";
import CategoryForm from "@/components/admin/CategoryForm";

type ModalMode = "add" | "edit" | null;

export default function AdminCategoriesPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const { categories, loading: catsLoading, error } = useAllCategories();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const handleAdd = async (data: CreateCategoryInput) => {
    await addCategory(data);
    setModalMode(null);
  };

  const handleEdit = async (data: CreateCategoryInput) => {
    if (!editTarget) return;
    await updateCategory(editTarget.id, data);
    setModalMode(null);
    setEditTarget(null);
  };

  const openEdit = (category: Category) => {
    setEditTarget(category);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <AdminLayout title="إدارة الفئات">

      {/* ─── Header Row ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-[#0f172a]">الفئات</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {categories.length} فئة — الفئات النشطة تظهر عند المستخدمين
          </p>
        </div>
        <button
          onClick={() => setModalMode("add")}
          className="flex items-center gap-2 bg-[#1a3c6e] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1a3c6e]/90 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة فئة
        </button>
      </div>

      {/* ─── Error ───────────────────────────────────────── */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ─── Loading ─────────────────────────────────────── */}
      {catsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-xl mx-auto mb-3" />
              <div className="h-3 bg-slate-100 rounded w-3/4 mx-auto mb-2" />
              <div className="h-2 bg-slate-100 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (

        /* ─── Empty State ──────────────────────────────── */
        <div className="bg-white rounded-xl border border-slate-100 p-16 flex flex-col items-center text-slate-400">
          <span className="text-5xl mb-4">🗂️</span>
          <p className="text-sm font-medium">لا توجد فئات بعد</p>
          <p className="text-xs mt-1">اضغط "إضافة فئة" لإنشاء أول فئة</p>
        </div>
      ) : (

        /* ─── Categories Grid ──────────────────────────── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* ─── Modal ───────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-[#0f172a]">
                {modalMode === "add" ? "إضافة فئة جديدة" : "تعديل الفئة"}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CategoryForm
              initialValues={editTarget ?? undefined}
              onSubmit={modalMode === "add" ? handleAdd : handleEdit}
              onCancel={closeModal}
              submitLabel={modalMode === "add" ? "إضافة الفئة" : "حفظ التعديلات"}
            />
          </div>
        </div>
      )}

    </AdminLayout>
  );
}