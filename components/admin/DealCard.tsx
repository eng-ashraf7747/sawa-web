// C:\sawa-web\components\admin\DealCard.tsx

"use client";

import { useState } from "react";
import { Deal } from "@/types/deal";
import { toggleDealActive, deleteDeal } from "@/lib/deals";

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
}

export default function DealCard({ deal, onEdit }: DealCardProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleDealActive(deal.id, deal.isActive);
    } catch {
      console.error("خطأ في تغيير حالة العرض");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`هل تريد حذف "${deal.title}" نهائياً؟`)) return;
    setDeleting(true);
    try {
      await deleteDeal(deal.id);
    } catch {
      console.error("خطأ في حذف العرض");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`
      relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 overflow-hidden
      ${deal.isActive ? "border-green-400" : "border-slate-100"}
    `}>

      {/* ─── Image ───────────────────────────────────────── */}
      {deal.imageUrl ? (
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
          <span className="text-4xl">🏷️</span>
        </div>
      )}

      {/* ─── Badge ───────────────────────────────────────── */}
      <div className={`
        absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full
        ${deal.isActive
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-400"
        }
      `}>
        {deal.isActive ? "نشط" : "معطل"}
      </div>

      {/* ─── Content ─────────────────────────────────────── */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1">{deal.title}</h3>
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{deal.description}</p>
        <p className="text-sm font-bold text-[#c9a84c] mb-3">{deal.discount}</p>

        {/* ─── Actions ─────────────────────────────────── */}
        <div className="flex gap-2">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`
              flex-1 text-xs font-medium py-2 rounded-lg transition-all disabled:opacity-50
              ${deal.isActive
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-green-50 text-green-600 hover:bg-green-100"
              }
            `}
          >
            {toggling ? "..." : deal.isActive ? "تعطيل" : "تفعيل"}
          </button>

          <button
            onClick={() => onEdit(deal)}
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
    </div>
  );
}