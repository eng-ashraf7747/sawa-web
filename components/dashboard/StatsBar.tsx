// C:\sawa-web\components\dashboard\StatsBar.tsx

"use client";
import { User } from "@/types";

interface StatsBarProps {
  userData: User | null;
  categoriesCount: number;
  requestsCount: number;
  activeSection: string;
  onCardClick: (section: string) => void;
}

const tierNames: Record<string, string> = {
  bronze: "برونزي",
  silver: "فضي",
  gold: "ذهبي",
  diamond: "ماسي",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  sectionId: string;
  activeSection: string;
  onClick: (section: string) => void;
}

const StatCard = ({ label, value, icon, sectionId, activeSection, onClick }: StatCardProps) => {
  const isActive = activeSection === sectionId;

  return (
    <button
      onClick={() => onClick(sectionId)}
      className={`flex-1 bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border-t-4 transition-all duration-200 cursor-pointer text-right
        ${isActive
          ? "border border-[#c9a84c] border-t-[#c9a84c] shadow-md scale-[1.02]"
          : "border border-[#e8eaed] border-t-[#c9a84c] hover:border-[#c9a84c] hover:shadow-md hover:scale-[1.02]"
        }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors
        ${isActive ? "bg-[#c9a84c]/20" : "bg-[#f0f4f8]"}`}>
        {icon}
      </div>
      <div>
        <p className="text-[#6b7280] text-xs mb-1">{label}</p>
        <p className={`text-2xl font-extrabold ${isActive ? "text-[#c9a84c]" : "text-[#1a3c6e]"}`}>
          {value}
        </p>
      </div>
    </button>
  );
};

export default function StatsBar({
  userData,
  categoriesCount,
  requestsCount,
  activeSection,
  onCardClick,
}: StatsBarProps) {
  return (
    <div className="flex gap-4 mb-8">
      <StatCard
        label="إجمالي النقاط"
        value={userData?.points ?? 0}
        icon="🏆"
        sectionId="points"
        activeSection={activeSection}
        onClick={onCardClick}
      />
      <StatCard
        label="الفئة الحالية"
        value={tierNames[userData?.tier ?? "bronze"]}
        icon="⭐"
        sectionId="profile"
        activeSection={activeSection}
        onClick={onCardClick}
      />
      <StatCard
        label="العروض المتاحة"
        value={categoriesCount}
        icon="🏷️"
        sectionId="deals"
        activeSection={activeSection}
        onClick={onCardClick}
      />
      <StatCard
        label="طلباتي النشطة"
        value={requestsCount}
        icon="📋"
        sectionId="requests"
        activeSection={activeSection}
        onClick={onCardClick}
      />
    </div>
  );
}