// C:\sawa-web\app\vendor\deals\page.tsx

"use client";

import { useState } from "react";
import { useVendorGuard } from "@/hooks/useVendorGuard";
import { useUser } from "@/hooks/useUser";
import { useVendorDeals } from "@/hooks/useDeals";
import { useActiveCategories } from "@/hooks/useCategories";
import { addDeal, updateDeal } from "@/lib/deals";
import { Deal, CreateDealInput, DEAL_STATUS_LABELS } from "@/types/deal";
import VendorLayout from "@/components/vendor/VendorLayout";
import DealForm from "@/components/admin/DealForm";

type ModalMode = "add" | "edit" | null;

export default function VendorDealsPage() {
  const { isAuthorized, loading: authLoading, vendorId } = useVendorGuard();
  const { userData } = useUser();
  const { deals, loading: dealsLoading } = useVendorDeals(vendorId ?? "");
  const { categories } = useActiveCategories();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Deal | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const handleAdd = async (data: CreateDealInput) => {
    await addDeal(data);
    setModalMode(null);
    setSelectedCategoryId("");
  };

  const handleEdit = async (data: CreateDealInput) => {
    if (!editTarget) return;
    await updateDeal(editTarget.id, data);
    setModalMode(null);
    setEditTarget(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setSelectedCategoryId("");
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
    <VendorLayout title="عروضي">

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="text-base font-bold text-[#0f172a]">عروضي</h2>
          <p className="text-xs text-slate-400 mt-0.5">{deals.length} عرض</p>
        </div>
        <button
          onClick={() => setModalMode("add")}
          className="flex items-center gap-2 bg-[#1a3c6e] text-white text-sm px-3 md:px-4 py-2 rounded-lg hover:bg-[#1a3c6e]/90 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">إضافة عرض</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>

      {/* ─── Deals List ──────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
        {dealsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center py-12 md:py-16 text-slate-400">
            <span className="text-5xl mb-4">🏷️</span>
            <p className="text-sm font-medium">لا توجد عروض بعد</p>
            <p className="text-xs mt-1">اضغط "إضافة عرض" لإنشاء أول عرض</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {deal.imageUrl ? (
                    <img src={deal.imageUrl} alt={deal.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🏷️</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{deal.title}</p>
                    <p className="text-xs text-[#c9a84c] font-medium">{deal.discount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`
                    text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full
                    ${deal.status === "active" ? "bg-green-100 text-green-700"
                      : deal.status === "pending" ? "bg-amber-100 text-amber-700"
                      : deal.status === "rejected" ? "bg-red-100 text-red-500"
                      : deal.status === "draft" ? "bg-slate-100 text-slate-500"
                      : "bg-slate-100 text-slate-400"}
                  `}>
                    {DEAL_STATUS_LABELS[deal.status]}
                  </span>
                  {(deal.status === "draft" || deal.status === "rejected") && (
                    <button
                      onClick={() => { setEditTarget(deal); setModalMode("edit"); }}
                      className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    >
                      تعديل
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Modal ───────────────────────────────────────── */}
      {modalMode && (
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

            {/* ─── اختيار الفئة عند الإضافة ──────────────── */}
            {modalMode === "add" && !selectedCategoryId && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 mb-3">اختر الفئة:</p>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 hover:border-[#1a3c6e] hover:bg-slate-50 transition text-right"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{cat.name}</p>
                      <p className="text-xs text-[#c9a84c]">{cat.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ─── فورم العرض ─────────────────────────────── */}
            {(selectedCategoryId || modalMode === "edit") && (
              <DealForm
                categoryId={modalMode === "add" ? selectedCategoryId : editTarget!.categoryId}
                initialValues={editTarget ?? undefined}
                onSubmit={modalMode === "add" ? handleAdd : handleEdit}
                onCancel={closeModal}
                submitLabel={modalMode === "add" ? "إرسال للمراجعة" : "حفظ التعديلات"}
                isVendor={true}
                vendorId={vendorId ?? undefined}
                vendorName={userData?.displayName ?? undefined}
              />
            )}
          </div>
        </div>
      )}

    </VendorLayout>
  );
}