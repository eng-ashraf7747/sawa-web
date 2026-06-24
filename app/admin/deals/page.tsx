// C:\sawa-web\app\admin\deals\page.tsx

"use client";

import { useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAllCategories } from "@/hooks/useCategories";
import { useAllDeals, usePendingDeals } from "@/hooks/useDeals";
import { addDeal, updateDeal, approveDeal, rejectDeal } from "@/lib/deals";
import { Deal, CreateDealInput, DEAL_STATUS_LABELS } from "@/types/deal";
import { Category } from "@/types/category";
import AdminLayout from "@/components/admin/AdminLayout";
import DealCard from "@/components/admin/DealCard";
import DealForm from "@/components/admin/DealForm";

type ModalMode = "add" | "edit" | null;

// ─── Pending Deals Section ─────────────────────────────────
function PendingDealsSection({ onEdit }: { onEdit: (deal: Deal) => void }) {
  const { deals, loading } = usePendingDeals();
  const [processing, setProcessing] = useState<string | null>(null);

  if (loading) return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 md:p-5 mb-6 animate-pulse h-24" />
  );

  if (deals.length === 0) return null;

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try { await approveDeal(id); } finally { setProcessing(null); }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try { await rejectDeal(id); } finally { setProcessing(null); }
  };

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 md:p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⏳</span>
        <h2 className="text-sm font-bold text-amber-800">
          عروض في انتظار الموافقة
        </h2>
        <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
          {deals.length}
        </span>
      </div>
      <div className="space-y-3">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-lg border border-amber-100 p-3 md:p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {deal.imageUrl ? (
                  <img src={deal.imageUrl} alt={deal.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🏷️</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{deal.title}</p>
                  <p className="text-xs text-[#c9a84c] font-medium">{deal.discount}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{deal.description}</p>
                  {deal.vendorId && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      المورد: {deal.vendorId.slice(0, 8)}...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <button
                  onClick={() => handleApprove(deal.id)}
                  disabled={processing === deal.id}
                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                >
                  {processing === deal.id ? "..." : "موافقة"}
                </button>
                <button
                  onClick={() => handleReject(deal.id)}
                  disabled={processing === deal.id}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                >
                  {processing === deal.id ? "..." : "رفض"}
                </button>
                <button
                  onClick={() => onEdit(deal)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition"
                >
                  تعديل
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Deals Panel (per category) ───────────────────────────
function DealsPanel({
  category,
  onAdd,
  onEdit,
}: {
  category: Category;
  onAdd: (cat: Category) => void;
  onEdit: (deal: Deal) => void;
}) {
  const { deals, loading, error } = useAllDeals(category.id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.emoji}</span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{category.name}</h3>
            <p className="text-xs text-slate-400">{deals.length} عرض</p>
          </div>
        </div>
        <button
          onClick={() => onAdd(category)}
          className="flex items-center gap-1.5 bg-[#1a3c6e] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#1a3c6e]/90 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة عرض
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-50 rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-slate-400">
          <span className="text-3xl mb-2">🏷️</span>
          <p className="text-xs">لا توجد عروض — اضغط "إضافة عرض"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin Deals Page ──────────────────────────────────────
export default function AdminDealsPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const { categories, loading: catsLoading } = useAllCategories();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editTarget, setEditTarget] = useState<Deal | null>(null);

  const handleAdd = async (data: CreateDealInput) => {
    await addDeal(data);
    setModalMode(null);
    setSelectedCategory(null);
  };

  const handleEdit = async (data: CreateDealInput) => {
    if (!editTarget) return;
    await updateDeal(editTarget.id, data);
    setModalMode(null);
    setEditTarget(null);
  };

  const openAdd = (category: Category) => {
    setSelectedCategory(category);
    setModalMode("add");
  };

  const openEdit = (deal: Deal) => {
    setEditTarget(deal);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCategory(null);
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
    <AdminLayout title="إدارة العروض">

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-base font-bold text-[#0f172a]">العروض</h2>
        <p className="text-xs text-slate-400 mt-0.5">إدارة عروض كل فئة بشكل منفصل</p>
      </div>

      {/* ─── Pending Deals ───────────────────────────────── */}
      <PendingDealsSection onEdit={openEdit} />

      {/* ─── Categories + Deals ──────────────────────────── */}
      {catsLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 md:p-16 flex flex-col items-center text-slate-400">
          <span className="text-5xl mb-4">🗂️</span>
          <p className="text-sm font-medium">لا توجد فئات بعد</p>
          <p className="text-xs mt-1">أضف فئات أولاً من صفحة إدارة الفئات</p>
        </div>
      ) : (
        categories.map((cat) => (
          <DealsPanel key={cat.id} category={cat} onAdd={openAdd} onEdit={openEdit} />
        ))
      )}

      {/* ─── Modal ───────────────────────────────────────── */}
      {modalMode && (selectedCategory || editTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-[#0f172a]">
                {modalMode === "add" ? "إضافة عرض جديد" : "تعديل العرض"}
              </h3>
              <button onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DealForm
              categoryId={modalMode === "add" ? selectedCategory!.id : editTarget!.categoryId}
              initialValues={editTarget ?? undefined}
              onSubmit={modalMode === "add" ? handleAdd : handleEdit}
              onCancel={closeModal}
              submitLabel={modalMode === "add" ? "إضافة العرض" : "حفظ التعديلات"}
            />
          </div>
        </div>
      )}

    </AdminLayout>
  );
}