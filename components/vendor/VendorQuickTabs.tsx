// C:\sawa-web\components\vendor\VendorQuickTabs.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const QUICK_TABS = [
  { id: "deals", label: "عروضي", icon: "🏷️", href: "/vendor/deals" },
  { id: "bookings", label: "الحجوزات", icon: "📦", href: "/vendor/bookings" },
  { id: "points", label: "نقاطي", icon: "⭐", href: "/vendor/points" },
] as const;

/**
 * شريط وصول سريع ثابت في كل شاشات المورد — 3 كروت جنب بعض في صف واحد
 * دائماً، على أي حجم شاشة (كمبيوتر، تابلت، موبايل) بلا استثناء، بنفس
 * الحجم والوضوح البصري لكروت StatsBar عند المستخدم — لكن كروابط تنقّل
 * بسيطة بلا أرقام حية (المحتوى محدَّد صراحة: عروضي، الحجوزات، نقاطي).
 */
export default function VendorQuickTabs() {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
      {QUICK_TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center gap-2 py-5 sm:py-6 px-2 rounded-2xl border-2 transition-all ${
              isActive
                ? "bg-[#1a3c6e] border-[#1a3c6e] text-white shadow-md"
                : "bg-white border-[#c9a84c]/50 text-[#0f172a] hover:border-[#c9a84c] shadow-sm"
            }`}
          >
            <span className="text-2xl sm:text-3xl">{tab.icon}</span>
            <span className="text-xs sm:text-sm font-bold">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}