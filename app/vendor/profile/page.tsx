// C:\sawa-web\app\vendor\profile\page.tsx

"use client";

import { useVendorGuard } from "@/hooks/useVendorGuard";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { useVendorProfileEdit } from "@/hooks/useVendorProfileEdit";
import VendorLayout from "@/components/vendor/VendorLayout";
import VendorProfileForm from "@/components/vendor/VendorProfileForm";

export default function VendorProfilePage() {
  const { isAuthorized, loading: authLoading, vendorId } = useVendorGuard();
  const { profile, loading: profileLoading } = useVendorProfile(
    isAuthorized && vendorId ? vendorId : ""
  );
  const { saving, error, success, save } = useVendorProfileEdit();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <VendorLayout title="ملفي التجاري">
      <div className="max-w-lg mx-auto">

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#1a3c6e]/10 flex items-center justify-center">
              <span className="text-xl">🏪</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">ملفي التجاري</h2>
              <p className="text-xs text-slate-400">
                هذه البيانات ستظهر للمستخدمين عند الاطلاع على عروضك
              </p>
            </div>
          </div>
        </div>

        {/* ─── Form ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
          {profileLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <VendorProfileForm
              profile={profile}
              onSave={(input) => save(vendorId!, input)}
              saving={saving}
              error={error}
              success={success}
            />
          )}
        </div>

      </div>
    </VendorLayout>
  );
}