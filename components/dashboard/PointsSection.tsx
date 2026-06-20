"use client";
import { useState } from "react";
import { User } from "@/types";
import { usePoints } from "@/hooks/usePoints";

interface PointsSectionProps {
  userData: User | null;
}

const tierConfig = {
  bronze: { label: "برونزي", color: "#cd7f32", bg: "#fdf3e7", icon: "🥉" },
  silver: { label: "فضي", color: "#9e9e9e", bg: "#f5f5f5", icon: "🥈" },
  gold: { label: "ذهبي", color: "#c9a84c", bg: "#fefce8", icon: "🥇" },
  diamond: { label: "ماسي", color: "#1a3c6e", bg: "#eff6ff", icon: "💎" },
};

const referralStatusConfig = {
  active: { label: "فعال", color: "#16a34a", bg: "#dcfce7" },
  expired: { label: "منتهي", color: "#6b7280", bg: "#f3f4f6" },
  pending: { label: "قيد المراجعة", color: "#d97706", bg: "#fef3c7" },
  rejected: { label: "مرفوض", color: "#dc2626", bg: "#fee2e2" },
};

export default function PointsSection({ userData }: PointsSectionProps) {
  const { summary, loading } = usePoints(userData?.uid);
  const [copied, setCopied] = useState(false);

  const tier = tierConfig[userData?.tier ?? "bronze"];
  const referralStatus = referralStatusConfig[userData?.referralStatus ?? "expired"];
  const canRequestCode = userData?.referralStatus === "expired" || userData?.referralStatus === "rejected";

  const handleCopy = async () => {
    if (!userData?.referralCode) return;
    await navigator.clipboard.writeText(userData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExpiryText = () => {
  if (!userData?.referralActivatedAt) return "";
  
  // Firestore Timestamp بيكون عنده .toDate()
  const raw = userData.referralActivatedAt as unknown as { toDate?: () => Date } | Date;
  const activated = typeof (raw as { toDate?: () => Date }).toDate === "function"
    ? (raw as { toDate: () => Date }).toDate()
    : new Date(raw as unknown as string);

  const expiry = new Date(activated.getTime() + 48 * 60 * 60 * 1000);
  return `فعال حتى ${expiry.toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ─── رصيدك الحالي ─── */}
      <div className="bg-gradient-to-br from-[#1a3c6e] to-[#0f2447] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">رصيدك الحالي</p>
            <p className="text-5xl font-extrabold tracking-tight">{userData?.points ?? 0}</p>
            <p className="text-white/60 text-sm mt-1">نقطة</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
              style={{ backgroundColor: tier.bg }}
            >
              {tier.icon}
            </div>
            <span className="text-xs font-bold" style={{ color: tier.color }}>
              {tier.label}
            </span>
          </div>
        </div>
      </div>

      {/* ─── كيف كسبت نقاطك ─── */}
      <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8eaed] bg-[#f8fafc]">
          <h3 className="text-[#1a3c6e] font-bold text-base">كيف كسبت نقاطك؟</h3>
        </div>
        <div className="divide-y divide-[#f0f4f8]">
          <PointsRow icon="🎁" label="مكافأة التسجيل" points={summary.signupBonus} positive />
          <PointsRow icon="👥" label="مشاركة كودك مع الآخرين" points={summary.referralOwner} positive />
          <PointsRow icon="🎟️" label="انضممت بكود صديق" points={summary.referralJoiner} positive />
          <PointsRow icon="📦" label="من الشهور السابقة" points={summary.carryOver} positive />
        </div>
      </div>

      {/* ─── استخدمت نقاطك في ─── */}
      {summary.subscriptionPayment > 0 && (
        <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e8eaed] bg-[#f8fafc]">
            <h3 className="text-[#1a3c6e] font-bold text-base">استخدمت نقاطك في</h3>
          </div>
          <div className="divide-y divide-[#f0f4f8]">
            <PointsRow icon="💳" label="اشتراك SAWA" points={summary.subscriptionPayment} positive={false} />
          </div>
        </div>
      )}

      {/* ─── كود الإحالة ─── */}
      <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8eaed] bg-[#f8fafc]">
          <h3 className="text-[#1a3c6e] font-bold text-base">كود الإحالة</h3>
        </div>
        <div className="p-6 flex flex-col gap-4">

          {/* الكود */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span
                className="text-3xl font-extrabold tracking-widest"
                style={{
                  color: userData?.referralStatus === "active" ? "#1a3c6e" : "#9ca3af",
                  letterSpacing: "0.3em",
                }}
              >
                {userData?.referralCode ?? "——"}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: referralStatus.color,
                    backgroundColor: referralStatus.bg,
                  }}
                >
                  {referralStatus.label}
                </span>
                {userData?.referralStatus === "active" && (
                  <span className="text-xs text-[#6b7280]">{getExpiryText()}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-[#1a3c6e]">
                {userData?.referralUsageCount ?? 0}
              </span>
              <span className="text-xs text-[#6b7280]">مرة استُخدم</span>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3">
            {userData?.referralStatus === "active" && (
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                style={{
                  backgroundColor: copied ? "#dcfce7" : "#1a3c6e",
                  color: copied ? "#16a34a" : "white",
                }}
              >
                {copied ? "✓ تم النسخ" : "📋 نسخ الكود"}
              </button>
            )}
            {canRequestCode && (
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border-2 border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-white transition-all duration-200"
              >
                🔄 طلب كود جديد
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

// ─── مكون صف النقاط ───────────────────────────────────────────
function PointsRow({
  icon,
  label,
  points,
  positive,
}: {
  icon: string;
  label: string;
  points: number;
  positive: boolean;
}) {
  if (points === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-[#f8fafc] transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-[#374151] text-sm font-medium">{label}</span>
      </div>
      <span
        className="text-base font-extrabold"
        style={{ color: positive ? "#16a34a" : "#dc2626" }}
      >
        {positive ? "+" : "-"}{points}
      </span>
    </div>
  );
}