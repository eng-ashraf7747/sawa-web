
// C:\sawa-web\components\dashboard\CategoryDealsView.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useActiveDeals } from "@/hooks/useDeals";
import { useActiveCategories } from "@/hooks/useCategories";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useProductRating } from "@/hooks/useBookingReviews";
import { useUser } from "@/hooks/useUser";
import { useUserBookings } from "@/hooks/useBookings";
import { Deal, formatDealExpiryLabel } from "@/types/deal";
import VendorProfileCard from "@/components/vendor/VendorProfileCard";
import BookingContactModal from "@/components/dashboard/BookingContactModal";
import { trackEvent } from "@/lib/analytics";

const COOLDOWN_MS = 30 * 60 * 1000; // 30 دقيقة

interface DealCardProps {
  deal: Deal;
  userId: string | null;
  categoryId: string;
  cooldownUntil: Date | null;
  onVendorClick: (vendorId: string, vendorName: string) => void;
  onBookClick: (deal: Deal) => void;
}

/**
 * سطر عرض تقييم السلعة (PRC-RVW-04)
 * ⭐ المتوسط (عدد المقيّمين) — أو "جديد" لو أقل من الحد الأدنى المطلوب
 * لا يُعرض أي شيء أثناء التحميل الأول تفادياً لومضة "جديد" قبل ظهور الرقم الفعلي
 *
 * مُغلَّف بـ memo لأن الـ prop الوحيدة (dealId) نص بسيط مستقر —
 * على عكس DealCard في الأسفل، لا توجد هنا مشكلة استقرار مراجع (reference stability)
 * تُبطل فائدة memo
 */
const ProductRatingLine = memo(({ dealId }: { dealId: string }) => {
  const { average, count, loading, load } = useProductRating(dealId);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return null;

  if (average === null) {
    return <p className="text-xs text-slate-400 mb-2">جديد</p>;
  }

  return (
    <p className="flex items-center gap-1 text-xs mb-2">
      <span className="text-[#c9a84c]">⭐</span>
      <span className="font-bold text-[#1a1a2e]">{average.toFixed(1)}</span>
      <span className="text-slate-400">({count})</span>
    </p>
  );
});
ProductRatingLine.displayName = "ProductRatingLine";

const DealCard = ({ deal, userId, categoryId, cooldownUntil, onVendorClick, onBookClick }: DealCardProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    trackEvent({
      eventType: "offer_viewed",
      userId: userId ?? null,
      offerId: deal.id,
      categoryId,
      metadata: { dealTitle: deal.title, vendorId: deal.vendorId ?? null },
    });
  }, [deal.id, userId, categoryId]);

  // تحديث الوقت
  useEffect(() => {
    if (!cooldownUntil) return;
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const isOnCooldown = cooldownUntil ? cooldownUntil.getTime() > now.getTime() : false;
  const expiryLabel = formatDealExpiryLabel(deal.expiresAt);
  const minutesLeft = isOnCooldown && cooldownUntil
    ? Math.max(1, Math.ceil((cooldownUntil.getTime() - now.getTime()) / 60000))
    : 0;

  const handleBookClick = () => {
    if (isOnCooldown) return;
    trackEvent({
      eventType: "offer_requested",
      userId: userId ?? null,
      offerId: deal.id,
      categoryId,
      metadata: { dealTitle: deal.title, vendorId: deal.vendorId ?? null },
    });
    onBookClick(deal);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-sm hover:shadow-md hover:border-[#c9a84c] transition-all duration-200 overflow-hidden group flex flex-col">
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

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[#1a1a2e] font-bold text-sm mb-1 line-clamp-2">{deal.title}</h3>
        <ProductRatingLine dealId={deal.id} />
        <p className="text-slate-500 text-xs mb-3 line-clamp-2">{deal.description}</p>
        <p className={`text-[#c9a84c] text-xl font-extrabold ${expiryLabel ? "mb-1" : "mb-4"}`}>{deal.discount}</p>
        {expiryLabel && (
          <p className="text-slate-400 text-[11px] mb-4">{expiryLabel}</p>
        )}

        <div className="flex gap-2 mt-auto">
          {deal.externalUrl && (
            <a
              href={deal.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`تفاصيل ${deal.title}`}
              className="flex-1 py-2 border border-[#1a3c6e] text-[#1a3c6e] rounded-xl text-xs font-bold text-center hover:bg-[#1a3c6e] hover:text-white transition-all duration-200"
            >
              التفاصيل
            </a>
          )}
          <button
            onClick={handleBookClick}
            disabled={isOnCooldown}
            aria-disabled={isOnCooldown}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              isOnCooldown
                ? "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
                : "bg-[#1a3c6e] text-white hover:bg-[#c9a84c] hover:text-[#1a3c6e]"
            }`}
          >
            {isOnCooldown ? `متاح بعد ${minutesLeft} د` : "احصل على العرض"}
          </button>
        </div>
      </div>

      {deal.vendorName && deal.vendorId && (
        <div className="px-4 py-2 bg-[#f8f9fb] border-t border-[#e8eaed] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs flex-shrink-0">🏪</span>
            <span className="text-xs text-slate-500 font-medium truncate">{deal.vendorName}</span>
          </div>
          <button
            onClick={() => onVendorClick(deal.vendorId!, deal.vendorName!)}
            aria-label={`تفاصيل المورد ${deal.vendorName}`}
            className="text-[10px] font-bold text-[#1a3c6e] hover:text-[#c9a84c] transition-colors flex-shrink-0"
          >
            تفاصيل المورد
          </button>
        </div>
      )}
    </div>
  );
};

function BookingWrapper({ deal, onClose, onBooked }: {
  deal: Deal;
  onClose: () => void;
  onBooked: (bookingId: string) => void;
}) {
  const { profile, loading } = useVendorProfile(deal.vendorId ?? "");

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-10 h-10 border-4 border-white border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50" dir="rtl">
        <div className="bg-white w-full md:w-96 rounded-t-2xl md:rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm mb-4">لا توجد بيانات تواصل لهذا المورد</p>
          <button onClick={onClose} className="w-full py-2 bg-[#1a3c6e] text-white rounded-xl text-sm font-bold">
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  return (
    <BookingContactModal
      deal={deal}
      vendor={profile}
      onClose={onClose}
      onBooked={onBooked}
    />
  );
}

interface CategoryDealsViewProps {
  categoryId: string;
  onBack: () => void;
}

export default function CategoryDealsView({ categoryId, onBack }: CategoryDealsViewProps) {
  const { userData } = useUser();
  const { deals, loading, error } = useActiveDeals(categoryId, userData?.city ?? "fayoum");
  const { categories } = useActiveCategories();
  const { bookings } = useUserBookings();

  const category = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId]);

  const [selectedVendor, setSelectedVendor] = useState<{ vendorId: string; vendorName: string } | null>(null);
  const [bookingDeal, setBookingDeal] = useState<Deal | null>(null);

  const [recentBookingTimes, setRecentBookingTimes] = useState<Record<string, Date>>({});

  useEffect(() => {
    const map: Record<string, Date> = {};
    bookings.forEach((booking) => {
      if (!booking.dealId) return;
      const createdAt = new Date(booking.createdAt);
      if (!map[booking.dealId] || createdAt.getTime() > map[booking.dealId].getTime()) {
        map[booking.dealId] = createdAt;
      }
    });
    setRecentBookingTimes(map);
  }, [bookings]);

  const getCooldownUntil = useCallback((dealId: string): Date | null => {
    const last = recentBookingTimes[dealId];
    if (!last) return null;
    const until = new Date(last.getTime() + COOLDOWN_MS);
    return until.getTime() > Date.now() ? until : null;
  }, [recentBookingTimes]);

  const handleBookClick = useCallback((deal: Deal) => {
    if (!userData?.uid || !deal.vendorId) return;
    setBookingDeal(deal);
  }, [userData?.uid]);

  const handleVendorClick = useCallback((vendorId: string, vendorName: string) => {
    setSelectedVendor({ vendorId, vendorName });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="الرجوع لكل الفئات"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-[#e8eaed] hover:bg-[#f0f4f8] transition-colors flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
        >
          <svg className="w-5 h-5 text-[#1a3c6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {category && <span className="text-2xl">{category.emoji}</span>}
          <div>
            <h1 className="text-[#1a1a2e] font-extrabold text-base">{category?.name ?? "العروض"}</h1>
            <p className="text-slate-400 text-xs">{deals.length} عرض متاح</p>
          </div>
        </div>
      </div>

      {error && <div className="text-center py-16 text-red-400 text-sm">{error}</div>}

      {!error && deals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🏷️</span>
          <p className="text-[#6b7280] text-sm font-medium">لا توجد عروض متاحة حالياً</p>
        </div>
      )}

      {deals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              userId={userData?.uid ?? null}
              categoryId={categoryId}
              cooldownUntil={getCooldownUntil(deal.id)}
              onVendorClick={handleVendorClick}
              onBookClick={handleBookClick}
            />
          ))}
        </div>
      )}

      {selectedVendor && (
        <VendorProfileCard
          vendorId={selectedVendor.vendorId}
          vendorName={selectedVendor.vendorName}
          onClose={() => setSelectedVendor(null)}
        />
      )}

      {bookingDeal && (
        <BookingWrapper
          deal={bookingDeal}
          onClose={() => setBookingDeal(null)}
          onBooked={() => {
            setRecentBookingTimes((prev) => ({
              ...prev,
              [bookingDeal.id]: new Date(),
            }));
          }}
        />
      )}
    </div>
  );
}
