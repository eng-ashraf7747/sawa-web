// C:\sawa-web\components\admin\DealCard.tsx

"use client";

import { useState } from "react";
import { Deal, DEAL_STATUS_LABELS } from "@/types/deal";
import { toggleDealActive, deleteDeal, approveDeal, rejectDeal } from "@/lib/deals";

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
}

export default function DealCard({ deal, onEdit }: DealCardProps) {
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggle = async () => {
    setProcessing(true);
    try {
      await toggleDealActive(deal.id, deal.status === "active");
    } catch {
      console.error("خطأ في تغيير حالة العرض");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await approveDeal(deal.id);
    } catch {
      console.error("خطأ في الموافقة");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await rejectDeal(deal.id);
    } catch {
      console.error("خطأ في الرفض");
    } finally {
      setProcessing(false);
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

  // ─── شريط الحالة ─────────────────────────────────────────
  const statusBar = {
    pending: {
      bg: "bg-amber-50 border-t border-amber-200",
      text: "text-amber-700",
      label: "في انتظار الموافقة",
    },
    active: {
      bg: "bg-green-50 border-t border-green-200",
      text: "text-green-700",
      label: "نشط",
    },
    inactive: {
      bg: "bg-slate-50 border-t border-slate-200",
      text: "text-slate-500",
      label: "معطل",
    },
    rejected: {
      bg: "bg-red-50 border-t border-red-200",
      text: "text-red-500",
      label: "مرفوض",
    },
    draft: {
      bg: "bg-slate-50 border-t border-slate-200",
      text: "text-slate-400",
      label: "مسودة",
    },
  };

  const bar = statusBar[deal.status];

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:shadow-md">

      {/* ─── Image ───────────────────────────────────────── */}
      {deal.imageUrl ? (
        <img src={deal.imageUrl} alt={deal.title} className="w-full h-32 object-cover" />
      ) : (
        <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
          <span className="text-4xl">🏷️</span>
        </div>
      )}

      {/* ─── Content ─────────────────────────────────────── */}
      <div className="p-3 md:p-4">
        <h3 className="text-sm font-bold text-slate-800 mb-1 truncate">{deal.title}</h3>
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{deal.description}</p>
        <p className="text-sm font-bold text-[#c9a84c] mb-3">{deal.discount}</p>

        {/* ─── Actions ─────────────────────────────────── */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(deal)}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
          >
            تعديل
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-all disabled:opacity-50"
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

      {/* ─── Status Bar ──────────────────────────────────── */}
      <div className={`${bar.bg} px-3 py-2 flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {deal.vendorName && (
            <span className={`text-xs font-medium truncate ${bar.text}`}>
              🏪 {deal.vendorName}
            </span>
          )}
          {!deal.vendorName && (
            <span className={`text-xs font-medium ${bar.text}`}>
              {bar.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {deal.status === "pending" && (
            <>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition"
              >
                {processing ? "..." : "موافقة"}
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition"
              >
                {processing ? "..." : "رفض"}
              </button>
            </>
          )}
          {deal.status === "active" && (
            <button
              onClick={handleToggle}
              disabled={processing}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 transition"
            >
              {processing ? "..." : "تعطيل"}
            </button>
          )}
          {deal.status === "inactive" && (
            <button
              onClick={handleToggle}
              disabled={processing}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition"
            >
              {processing ? "..." : "تفعيل"}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}