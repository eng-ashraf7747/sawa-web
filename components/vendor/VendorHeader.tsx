// C:\sawa-web\components\vendor\VendorHeader.tsx

"use client";

import { useState } from "react";
import { User } from "@/types";

interface VendorHeaderProps {
  title: string;
  userData: User | null;
  onMenuClick: () => void;
}

export default function VendorHeader({ title, userData, onMenuClick }: VendorHeaderProps) {
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const hasAvatarPhoto = Boolean(userData?.photoURL) && !avatarLoadFailed;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-6 py-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="فتح القائمة"
        >
          <svg className="w-5 h-5 text-[#1a3c6e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#0f172a]">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          aria-label="الإشعارات"
          className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="text-lg" aria-hidden="true">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#c9a84c] rounded-full" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-sm">
            {hasAvatarPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element -- رابط خارجي ديناميكي من Firebase Storage
              <img
                src={userData!.photoURL!}
                alt="الصورة الشخصية"
                className="w-full h-full object-cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <span aria-hidden="true">🏪</span>
            )}
          </div>
          <span className="hidden sm:inline text-[#0f172a] text-sm font-semibold">
            {userData?.displayName ?? "المورد"}
          </span>
        </div>
      </div>
    </header>
  );
}