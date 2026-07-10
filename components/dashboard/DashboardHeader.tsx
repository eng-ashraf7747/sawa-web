// C:\sawa-web\components\dashboard\DashboardHeader.tsx

"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { User } from "@/types";

interface DashboardHeaderProps {
  userData: User | null;
  activePage: string;
}

const pageNames: Record<string, string> = {
  home: "الرئيسية",
  deals: "العروض المتاحة",
  requests: "الخدمات المطلوبة",
  profile: "بياناتي",
  points: "سجل نقاطي",
};

const MemoizedPageName = memo(({ activePage }: { activePage: string }) => (
  <span className="text-white font-semibold">
    {pageNames[activePage] ?? "الرئيسية"}
  </span>
));
MemoizedPageName.displayName = "MemoizedPageName";

export default function DashboardHeader({ userData, activePage }: DashboardHeaderProps) {
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const hasAvatarPhoto = Boolean(userData?.photoURL) && !avatarLoadFailed;

  return (
    <header
      className="h-16 bg-[#1a3c6e] flex items-center justify-between px-4 md:px-8 shadow-md overflow-visible relative z-10"
      role="banner"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-white/70 text-sm">
        <span className="hidden sm:inline">سوا</span>
        <span className="hidden sm:inline">/</span>
        <MemoizedPageName activePage={activePage} />
      </div>

      {/* Logo */}
      <div className="flex-1 flex justify-center items-end translate-y-2">
        <Image
          src="/Sawa-paner.png"
          alt="سوا معاً"
          height={90}
          width={200}
          className="object-contain opacity-90 w-32 md:w-[200px]"
          priority
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button
          aria-label="الإشعارات"
          className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="text-lg" aria-hidden="true">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#c9a84c] rounded-full" />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-sm">
            {hasAvatarPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element -- رابط خارجي ديناميكي من Firebase Storage؛ next/image يتطلب images.remotePatterns غير مُعدّة حاليًا
              <img
                src={userData!.photoURL!}
                alt="الصورة الشخصية"
                className="w-full h-full object-cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <span aria-hidden="true">👤</span>
            )}
          </div>
          <span className="hidden sm:inline text-white text-sm font-semibold">
            {userData?.displayName ?? "مستخدم"}
          </span>
        </div>
      </div>
    </header>
  );
}