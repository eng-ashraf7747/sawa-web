// C:\sawa-web\app\deals\[categoryId]\page.tsx

"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveDeals } from "@/hooks/useDeals";
import { useActiveCategories } from "@/hooks/useCategories";
import { Deal } from "@/types/deal";
import VendorProfileCard from "@/components/vendor/VendorProfileCard";

function DealCard({
  deal,
  onVendorClick,
}: {
  deal: Deal;
  onVendorClick: (vendorId: string, vendorName: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-sm hover:shadow-md hover:border-[#c9a84c] transition-all duration-200 overflow-hidden group flex flex-col">

      {/* ─── Image ───────────────────────────────────────── */}
      {deal.imageUrl ? (
        <div className="w-full h-40 overflow-hidden flex-shrink-0">
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-[#f0f4f8] flex items-center justify-center flex-shrink-0">
          <span className="text-5xl">🏷️</span>
        </div>
      )}

      {/* ─── Content ─────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[#1a1a2e] font-bold text-sm mb-1">{deal.title}</h3>
        <p className="text-slate-500 text-xs mb-3 line-clamp-2">{deal.description}</p>
        <p className="text-[#c9a84c] text-xl font-extrabold mb-4">{deal.discount}</p>

        {/* ─── Actions ─────────────────────────────────── */}
        <div className="flex gap-2 mt-auto">
          {deal.externalUrl && (
            
            <a  
            href={deal.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 border border-[#1a3c6e] text-[#1a3c6e] rounded-xl text-xs font-bold text-center hover:bg-[#1a3c6e] hover:text-white transition-all duration-200"
            >
              التفاصيل
            </a>
          )}
          <button className="flex-1 py-2 bg-[#1a3c6e] text-white rounded-xl text-xs font-bold hover:bg-[#c9a84c] hover:text-[#1a3c6e] transition-all duration-200">
            احصل على العرض
          </button>
        </div>
      </div>

      {/* ─── Vendor Bar ──────────────────────────────────── */}
      {deal.vendorName && deal.vendorId && (
        <div className="px-4 py-2 bg-[#f8f9fb] border-t border-[#e8eaed] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs flex-shrink-0">🏪</span>
            <span className="text-xs text-slate-500 font-medium truncate">{deal.vendorName}</span>
          </div>
          <button
            onClick={() => onVendorClick(deal.vendorId!, deal.vendorName!)}
            className="text-[10px] font-bold text-[#1a3c6e] hover:text-[#c9a84c] transition-colors flex-shrink-0 whitespace-nowrap"
          >
            تفاصيل المورد ←
          </button>
        </div>
      )}

    </div>
  );
}

export default function DealsPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);
  const router = useRouter();
  const { deals, loading, error } = useActiveDeals(categoryId);
  const { categories } = useActiveCategories();
  const category = categories.find((c) => c.id === categoryId);
  const [selectedVendor, setSelectedVendor] = useState<{
    vendorId: string;
    vendorName: string;
  } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center" dir="rtl">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]" dir="rtl">

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e8eaed] px-4 md:px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f0f4f8] hover:bg-[#e8eaed] transition"
        >
          <svg className="w-5 h-5 text-[#1a3c6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {category && <span className="text-2xl">{category.emoji}</span>}
          <div>
            <h1 className="text-[#1a1a2e] font-extrabold text-base">
              {category?.name ?? "العروض"}
            </h1>
            <p className="text-slate-400 text-xs">{deals.length} عرض متاح</p>
          </div>
        </div>
      </div>

      {/* ─── Deals Grid ──────────────────────────────────── */}
      <div className="p-4 md:p-6">
        {error && (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        )}
        {!error && deals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">🏷️</span>
            <p className="text-[#6b7280] text-sm font-medium">لا توجد عروض متاحة حالياً</p>
            <p className="text-[#c9a84c] text-xs mt-1">سيتم إضافة عروض قريباً</p>
          </div>
        )}
        {deals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onVendorClick={(vendorId, vendorName) =>
                  setSelectedVendor({ vendorId, vendorName })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Vendor Profile Modal ────────────────────────── */}
      {selectedVendor && (
        <VendorProfileCard
          vendorId={selectedVendor.vendorId}
          vendorName={selectedVendor.vendorName}
          onClose={() => setSelectedVendor(null)}
        />
      )}

    </div>
  );
}