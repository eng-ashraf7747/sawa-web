// C:\sawa-web\app\admin\categories\page.tsx

"use client";

import { useState, useEffect } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAllCategories } from "@/hooks/useCategories";
import {
  addCategory,
  updateCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  toggleSubcategoryActive,
  getAllSubcategories,
} from "@/lib/categories";
import { Category, CreateCategoryInput, Subcategory, CreateSubcategoryInput } from "@/types/category";
import AdminLayout from "@/components/admin/AdminLayout";
import CategoryCard from "@/components/admin/CategoryCard";
import CategoryForm from "@/components/admin/CategoryForm";

type ModalMode = "add" | "edit" | null;
type SubModalMode = "add" | "edit" | null;

export default function AdminCategoriesPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const { categories, loading: catsLoading, error } = useAllCategories();

  const [modalMode, setModalMode] = useState <ModalMode>(null);
  const [editTarget, setEditTarget] = useState <Category | null>(null);

  const [selectedCategory, setSelectedCategory] = useState <Category | null>(null);
  const [subcategories, setSubcategories] = useState <Subcategory[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  const [subModalMode, setSubModalMode] = useState <SubModalMode>(null);
  const [editSubTarget, setEditSubTarget] = useState <Subcategory | null>(null);
  const [subName, setSubName] = useState("");
  const [subOrder, setSubOrder] = useState(0);
  const [subSaving, setSubSaving] = useState(false);

  const loadSubcategories = async (categoryId: string) => {
    setSubsLoading(true);
    try {
      const data = await getAllSubcategories(categoryId);
      setSubcategories(data);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) loadSubcategories(selectedCategory.id);
  }, [selectedCategory]);

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

  const handleAddSub = async () => {
    if (!selectedCategory || !subName.trim()) return;
    setSubSaving(true);
    try {
      await addSubcategory({
        name: subName.trim(),
        categoryId: selectedCategory.id,
        isActive: true,
        order: subOrder,
      });
      await loadSubcategories(selectedCategory.id);
      setSubModalMode(null);
      setSubName("");
      setSubOrder(0);
    } finally {
      setSubSaving(false);
    }
  };

  const handleEditSub = async () => {
    if (!selectedCategory || !editSubTarget || !subName.trim()) return;
    setSubSaving(true);
    try {
      await updateSubcategory(selectedCategory.id, editSubTarget.id, {
        name: subName.trim(),
        order: subOrder,
      });
      await loadSubcategories(selectedCategory.id);
      setSubModalMode(null);
      setEditSubTarget(null);
      setSubName("");
      setSubOrder(0);
    } finally {
      setSubSaving(false);
    }
  };

  const handleDeleteSub = async (sub: Subcategory) => {
    if (!selectedCategory) return;
    await deleteSubcategory(selectedCategory.id, sub.id);
    await loadSubcategories(selectedCategory.id);
  };

  const handleToggleSub = async (sub: Subcategory) => {
    if (!selectedCategory) return;
    await toggleSubcategoryActive(selectedCategory.id, sub.id, sub.isActive);
    await loadSubcategories(selectedCategory.id);
  };

  const openEditSub = (sub: Subcategory) => {
    setEditSubTarget(sub);
    setSubName(sub.name);
    setSubOrder(sub.order);
    setSubModalMode("edit");
  };

  const closeSubModal = () => {
    setSubModalMode(null);
    setEditSubTarget(null);
    setSubName("");
    setSubOrder(0);
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

      <div className="px-4 md:px-6 lg:px-8 py-6" dir="rtl">

        {/* ─── الفئات الرئيسية ─── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">الفئات الرئيسية</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {categories.length} فئة — اضغط على فئة لإدارة فئاتها الفرعية
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

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

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
          <div className="bg-white rounded-xl border border-slate-100 p-16 flex flex-col items-center text-slate-400">
            <span className="text-5xl mb-4">🗂️</span>
            <p className="text-sm font-medium">لا توجد فئات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer transition ${
                  selectedCategory?.id === cat.id
                    ? "ring-2 ring-[#c9a84c] rounded-xl"
                    : ""
                }`}
              >
                <CategoryCard category={cat} onEdit={openEdit} onSelect={setSelectedCategory} />
              </div>
            ))}
          </div>
        )}

        {/* ─── الفئات الفرعية ─── */}
        {selectedCategory && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#0f172a]">
                  الفئات الفرعية — {selectedCategory.emoji} {selectedCategory.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {subcategories.length} فئة فرعية
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg transition"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => setSubModalMode("add")}
                  className="flex items-center gap-2 bg-[#c9a84c] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#b8973b] transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  إضافة فئة فرعية
                </button>
              </div>
            </div>

            {subsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
              </div>
            ) : subcategories.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 p-10 flex flex-col items-center text-slate-400">
                <span className="text-4xl mb-3">📂</span>
                <p className="text-sm">لا توجد فئات فرعية بعد</p>
                <p className="text-xs mt-1">اضغط "إضافة فئة فرعية" لإنشاء أول فئة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm text-[#1a3c6e]">{sub.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">ترتيب: {sub.order}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSub(sub)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold transition ${
                          sub.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {sub.isActive ? "نشط" : "معطل"}
                      </button>
                      <button
                        onClick={() => openEditSub(sub)}
                        className="text-[#1a3c6e] hover:text-[#c9a84c] transition"
                        title="تعديل"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSub(sub)}
                        className="text-red-300 hover:text-red-500 transition"
                        title="حذف"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Modal الفئة الرئيسية ─── */}
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-[#0f172a]">
                  {modalMode === "add" ? "إضافة فئة جديدة" : "تعديل الفئة"}
                </h3>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
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

        {/* ─── Modal الفئة الفرعية ─── */}
        {subModalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-[#0f172a]">
                  {subModalMode === "add" ? "إضافة فئة فرعية" : "تعديل الفئة الفرعية"}
                </h3>
                <button onClick={closeSubModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold text-[#1a3c6e] mb-1 block">اسم الفئة الفرعية</label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="مثال: كتب خارجية"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a3c6e]"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1a3c6e] mb-1 block">الترتيب</label>
                  <input
                    type="number"
                    value={subOrder}
                    onChange={(e) => setSubOrder(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1a3c6e]"
                  />
                </div>

                <button
                  onClick={subModalMode === "add" ? handleAddSub : handleEditSub}
                  disabled={subSaving || !subName.trim()}
                  className="w-full bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {subSaving ? "جاري الحفظ..." : subModalMode === "add" ? "إضافة" : "حفظ"}
                </button>
                <button onClick={closeSubModal} className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm transition">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}