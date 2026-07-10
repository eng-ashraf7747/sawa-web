// C:\sawa-web\components\dashboard\PointsSection.tsx

"use client";
import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { User } from "@/types";
import { usePoints } from "@/hooks/usePoints";
import { TIERS } from "@/constants";

interface PointsSectionProps {
  userData: User | null;
}

const referralStatusConfig = {
  active: { label: "فعال", color: "#16a34a", bg: "#dcfce7" },
  expired: { label: "منتهي", color: "#6b7280", bg: "#f3f4f6" },
  pending: { label: "قيد المراجعة", color: "#d97706", bg: "#fef3c7" },
  rejected: { label: "مرفوض", color: "#dc2626", bg: "#fee2e2" },
};

export default function PointsSection({ userData }: PointsSectionProps) {
  const { summary, loading } = usePoints(userData?.uid);
  const [copied, setCopied] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestMsg, setRequestMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(true);

  const tierKey = userData?.tier ?? "bronze";
  const tier = TIERS[tierKey] || TIERS.bronze;
  const referralStatus = referralStatusConfig[userData?.referralStatus ?? "expired"];

  // ─── حساب حالة الزر ─────────────────────────────
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const requestCount = userData?.referralRequestMonth === currentMonth
    ? (userData?.referralRequestCount ?? 0)
    : 0;
  const remainingRequests = 3 - requestCount;

  const canRequest = userData?.referralStatus !== "active" && remainingRequests > 0;

  const getDisabledReason = () => {
    if (userData?.referralStatus === "active") return "يوجد كود فعال حالياً";
    if (remainingRequests <= 0) return "تم استهلاك عدد الطلبات المتاحة شهرياً";
    return null;
  };

  const disabledReason = getDisabledReason();

  // ─── نسخ الكود ─────────────────────────────
  const handleCopy = async () => {
    if (!userData?.referralCode) return;
    await navigator.clipboard.writeText(userData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── طلب كود جديد ─────────────────────────────
  const handleRequestCode = async () => {
    if (!canRequest || requesting) return;
    setRequesting(true);
    setRequestMsg(null);
    try {
      const functions = getFunctions(undefined, "us-central1");
      const requestCode = httpsCallable(functions, "onReferralRequest");
      await requestCode({});
      setRequestMsg({ type: "success", text: "✓ تم تفعيل كود الإحالة الجديد" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ، حاول مرة أخرى";
      setRequestMsg({ type: "error", text: message });
    } finally {
      setRequesting(false);
    }
  };

  // ─── مسح رسالة النتيجة تلقائيًا بعد 5 ثواني ─────────────────────────────
  useEffect(() => {
    if (requestMsg) {
      const timer = setTimeout(() => setRequestMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [requestMsg]);

  // ─── تاريخ انتهاء الكود ─────────────────────────────
  const getExpiryText = () => {
    if (!userData?.referralActivatedAt) return "";
    const raw = userData.referralActivatedAt as unknown as { toDate?: () => Date } | Date;
    const activated = typeof (raw as { toDate?: () => Date }).toDate === "function"
      ? (raw as { toDate: () => Date }).toDate()
      : new Date(raw as unknown as string);
    const expiry = new Date(activated.getTime() + 48 * 60 * 60 * 1000);
    return `فعال حتى ${expiry.toLocaleDateString("ar-EG", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
    })}`;
  };

  const hasAnyEarningSource =
    summary.signupBonus > 0 ||
    summary.referralOwner > 0 ||
    summary.referralJoiner > 0 ||
    summary.carryOver > 0;

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
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
              style={{ backgroundColor: tier.bg }}>
              {tier.icon}
            </div>
            <span className="text-xs font-bold" style={{ color: tier.color }}>{tier.nameAr}</span>
          </div>
        </div>
      </div>

      {/* ─── كيف كسبت نقاطك (Accordion) ─── */}
      <div className="bg-white rounded-2xl border border-[#e8eaed] shadow-sm overflow-hidden">
        <button
          onClick={() => setSourcesOpen((prev) => !prev)}
          aria-expanded={sourcesOpen}
          aria-controls="points-sources-panel"
          className="w-full flex items-center justify-between px-6 py-4 border-b border-[#e8eaed] bg-[#f8fafc] hover:bg-[#f0f4f8] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
        >
          <h3 className="text-[#1a3c6e] font-bold text-base">كيف كسبت نقاطك؟</h3>
          <svg
            className={`w-5 h-5 text-[#1a3c6e] transition-transform duration-200 ${sourcesOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {sourcesOpen && (
          <div id="points-sources-panel" className="divide-y divide-[#f0f4f8]">
            {hasAnyEarningSource ? (
              <>
                <PointsRow icon="🎁" label="مكافأة التسجيل" points={summary.signupBonus} positive />
                <PointsRow icon="👥" label="مشاركة كودك مع الآخرين" points={summary.referralOwner} positive />
                <PointsRow icon="🎟️" label="انضممت بكود صديق" points={summary.referralJoiner} positive />
                <PointsRow icon="📦" label="من الشهور السابقة" points={summary.carryOver} positive />
              </>
            ) : (
              <p className="text-center text-[#9ca3af] text-sm py-6">لا توجد مصادر نقاط مسجّلة بعد</p>
            )}
          </div>
        )}
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

          {/* الكود والحالة */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-extrabold tracking-widest"
                style={{
                  color: userData?.referralStatus === "active" ? "#1a3c6e" : "#9ca3af",
                  letterSpacing: "0.3em",
                }}>
                {userData?.referralCode ?? "——"}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: referralStatus.color, backgroundColor: referralStatus.bg }}>
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
          <div className="flex flex-col gap-3">
            {userData?.referralStatus === "active" && (
              <button onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                style={{
                  backgroundColor: copied ? "#dcfce7" : "#1a3c6e",
                  color: copied ? "#16a34a" : "white",
                }}>
                {copied ? "✓ تم النسخ" : "📋 نسخ الكود"}
              </button>
            )}

            {/* زر طلب كود جديد */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleRequestCode}
                disabled={!canRequest || requesting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                style={{
                  backgroundColor: canRequest ? "#16a34a" : "#e5e7eb",
                  color: canRequest ? "white" : "#9ca3af",
                  cursor: canRequest ? "pointer" : "not-allowed",
                }}>
                {requesting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري التفعيل...</>
                ) : (
                  "🔄 طلب كود إحالة جديد"
                )}
              </button>

              {/* سبب التعطيل */}
              {disabledReason && (
                <p className="text-xs text-center text-[#9ca3af]">{disabledReason}</p>
              )}

              {/* عدد الطلبات المتبقية */}
              {canRequest && (
                <p className="text-xs text-center text-[#6b7280]">
                  متبقي لك <span className="font-bold text-[#1a3c6e]">{remainingRequests}</span> طلب من أصل 3 هذا الشهر
                </p>
              )}

              {/* رسالة النتيجة */}
              {requestMsg && (
                <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold"
                  style={{
                    backgroundColor: requestMsg.type === "success" ? "#dcfce7" : "#fee2e2",
                    color: requestMsg.type === "success" ? "#16a34a" : "#dc2626",
                  }}>
                  {requestMsg.text}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// ─── مكون صف النقاط ─────────────────────────────
function PointsRow({ icon, label, points, positive }: {
  icon: string; label: string; points: number; positive: boolean;
}) {
  if (points === 0) return null;
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-[#f8fafc] transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-[#374151] text-sm font-medium">{label}</span>
      </div>
      <span className="text-base font-extrabold" style={{ color: positive ? "#16a34a" : "#dc2626" }}>
        {positive ? "+" : "-"}{points}
      </span>
    </div>
  );
}