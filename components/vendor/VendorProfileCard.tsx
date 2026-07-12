// C:\sawa-web\components\vendor\VendorProfileCard.tsx

"use client";

import { useEffect } from "react";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useVendorRating } from "@/hooks/useBookingReviews";

interface VendorProfileCardProps {
  vendorId: string;
  vendorName: string;
  onClose: () => void;
}

export default function VendorProfileCard({
  vendorId,
  vendorName,
  onClose,
}: VendorProfileCardProps) {
  const { profile, loading } = useVendorProfile(vendorId);
  const { average, count, loading: ratingLoading, load } = useVendorRating(vendorId);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* ─── Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#0f172a]">بطاقة المورد</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ─── Content ───────────────────────────────────── */}
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* ─── Business Name ──────────────────────── */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#1a3c6e]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏪</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0f172a]">
                    {profile?.businessName ?? vendorName}
                  </h4>
                  {profile?.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{profile.description}</p>
                  )}
                </div>
              </div>

              {/* ─── Rating (PRC-RVW-02 عبر bookingReviews) ─── */}
              {!ratingLoading && (
                <div className="flex items-center gap-2 mb-4 bg-[#f8f9fb] rounded-xl px-4 py-3">
                  {average !== null ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(average) ? "text-[#c9a84c]" : "text-slate-200"}`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-[#1a3c6e]">{average.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({count} تقييم)</span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">مورد جديد — لا توجد تقييمات كافية بعد</span>
                  )}
                </div>
              )}

              {/* ─── Contact Details ─────────────────────── */}
              <div className="space-y-2 mb-4">
                {profile?.address && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="text-base flex-shrink-0">📍</span>
                    <span className="text-xs">{profile.address}</span>
                  </div>
                )}
              </div>

              {/* ─── Action Buttons ──────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {profile?.mapsUrl && (
                  <a
                    href={profile.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#f0f4f8] text-[#1a3c6e] text-xs font-bold hover:bg-[#e8eaed] transition"
                  >
                    <span>📍</span>
                    <span>الموقع</span>
                  </a>
                )}
                {profile?.phone && (
                  
                  <a 
                  href={`tel:${profile.phone}`}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#f0f4f8] text-[#1a3c6e] text-xs font-bold hover:bg-[#e8eaed] transition"
                  >
                    <span>📞</span>
                    <span>اتصال</span>
                  </a>
                )}
                {profile?.whatsapp && (
                  
                  <a 
                  href={`https://wa.me/2${profile.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25d366] text-white text-xs font-bold hover:bg-[#22c55e] transition"
                  >
                    <span>💬</span>
                    <span>واتساب</span>
                  </a>
                )}
              </div>

              {/* ─── No Data ─────────────────────────────── */}
              {!profile && (
                <div className="flex flex-col items-center py-6 text-slate-400">
                  <span className="text-3xl mb-2">🏪</span>
                  <p className="text-sm">{vendorName}</p>
                  <p className="text-xs mt-1">لم يتم إضافة بيانات المورد بعد</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}