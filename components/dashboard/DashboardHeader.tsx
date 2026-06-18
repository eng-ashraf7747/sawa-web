"use client";
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

export default function DashboardHeader({ userData, activePage }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-[#1a3c6e] flex items-center justify-between px-8 shadow-md overflow-visible relative z-10">
      {/* ─── Breadcrumb ─────────────────────────────────── */}
      <div className="flex items-center gap-2 text-white/70 text-sm">
        <span>سوا</span>
        <span>/</span>
        <span className="text-white font-semibold">
          {pageNames[activePage] ?? "الرئيسية"}
        </span>
      </div>

      {/* ─── صورة سوا في المنتصف ─────────────────────────── */}
      <div className="flex-1 flex justify-center items-end translate-y-2">

        <Image
          src="/Sawa-paner.png"
          alt="سوا معاً"
          height={90}
          width={200}
          className="object-contain opacity-90"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* ─── Left Actions ───────────────────────────────── */}
      <div className="flex items-center gap-4">
        {/* الإشعارات */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer">
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#c9a84c] rounded-full" />
        </button>

        {/* اسم المستخدم */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
            👤
          </div>
          <span className="text-white text-sm font-semibold">
            {userData?.displayName ?? "مستخدم"}
          </span>
        </div>
      </div>
    </header>
  );
}