// C:\sawa-web\components\dashboard\StatsBar.tsx

"use client";
import { memo } from "react";
import { User } from "@/types";
import { TIERS } from "@/constants";

interface StatsBarProps {
  userData: User | null;
  categoriesCount: number;
  requestsCount: number;
  purchasesCount: number;
  activeSection: string;
  onCardClick: (section: string) => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  sectionId: string;
  activeSection: string;
  onClick: (section: string) => void;
}

const StatCard = memo(({ label, value, icon, sectionId, activeSection, onClick }: StatCardProps) => {
  const isActive = activeSection === sectionId;
  return (
    <button
      onClick={() => onClick(sectionId)}
      aria-current={isActive ? "page" : undefined}
      className={`flex-1 bg-white rounded-2xl p-3 md:p-5 flex items-center gap-2 md:gap-4 shadow-sm border-t-4 transition-all duration-200 cursor-pointer text-right
        ${isActive
          ? "border border-[#c9a84c] border-t-[#c9a84c] shadow-md scale-[1.02]"
          : "border border-[#e8eaed] border-t-[#c9a84c] hover:border-[#c9a84c] hover:shadow-md hover:scale-[1.02]"
        }`}
    >
      <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-2xl flex-shrink-0 transition-colors
        ${isActive ? "bg-[#c9a84c]/20" : "bg-[#f0f4f8]"}`}>
        {icon}
      </div>
      <div>
        <p className="text-[#6b7280] text-[10px] md:text-xs mb-0.5 md:mb-1">{label}</p>
        <p className={`text-lg md:text-2xl font-extrabold ${isActive ? "text-[#c9a84c]" : "text-[#1a3c6e]"}`}>
          {value}
        </p>
      </div>
    </button>
  );
});

StatCard.displayName = "StatCard";

interface CombinedTierPointsCardProps {
  tierNameAr: string;
  tierIcon: string;
  points: number;
  activeSection: string;
  onClick: (section: string) => void;
}

const CombinedTierPointsCard = memo(({
  tierNameAr,
  tierIcon,
  points,
  activeSection,
  onClick,
}: CombinedTierPointsCardProps) => {
  const isTierActive = activeSection === "profile";
  const isPointsActive = activeSection === "points";

  return (
    <div
      className={`flex-1 bg-white rounded-2xl shadow-sm border-t-4 border-t-[#c9a84c] flex items-stretch overflow-hidden transition-all duration-200
        ${isTierActive || isPointsActive ? "border border-[#c9a84c] shadow-md" : "border border-[#e8eaed]"}`}
    >
      <button
        onClick={() => onClick("profile")}
        aria-current={isTierActive ? "page" : undefined}
        className="flex-1 flex items-center gap-2 p-3 md:p-5 text-right cursor-pointer hover:bg-[#f8f9fb] transition-colors"
      >
        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-2xl flex-shrink-0 transition-colors
          ${isTierActive ? "bg-[#c9a84c]/20" : "bg-[#f0f4f8]"}`}>
          {tierIcon}
        </div>
        <div>
          <p className="text-[#6b7280] text-[10px] md:text-xs mb-0.5 md:mb-1">بياناتي</p>
          <p className={`text-sm md:text-lg font-extrabold ${isTierActive ? "text-[#c9a84c]" : "text-[#1a3c6e]"}`}>
            {tierNameAr}
          </p>
        </div>
      </button>

      <div className="w-px bg-[#e8eaed] my-3 md:my-4" />

      <button
        onClick={() => onClick("points")}
        aria-current={isPointsActive ? "page" : undefined}
        className="flex-1 flex items-center gap-2 p-3 md:p-5 text-right cursor-pointer hover:bg-[#f8f9fb] transition-colors"
      >
        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-2xl flex-shrink-0 transition-colors
          ${isPointsActive ? "bg-[#c9a84c]/20" : "bg-[#f0f4f8]"}`}>
          🏆
        </div>
        <div>
          <p className="text-[#6b7280] text-[10px] md:text-xs mb-0.5 md:mb-1">إجمالي النقاط</p>
          <p className={`text-lg md:text-2xl font-extrabold ${isPointsActive ? "text-[#c9a84c]" : "text-[#1a3c6e]"}`}>
            {points}
          </p>
        </div>
      </button>
    </div>
  );
});

CombinedTierPointsCard.displayName = "CombinedTierPointsCard";

export default function StatsBar({
  userData,
  categoriesCount,
  requestsCount,
  purchasesCount,
  activeSection,
  onCardClick,
}: StatsBarProps) {
  const tierKey = userData?.tier ?? "bronze";
  const tier = TIERS[tierKey] || TIERS.bronze;

  return (
    <div className="grid grid-cols-2 md:flex gap-3 md:gap-4 mb-6 md:mb-8">
      <StatCard
        label="مشترياتي"
        value={purchasesCount}
        icon="🛍️"
        sectionId="bookings"
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
      <CombinedTierPointsCard
        tierNameAr={tier.nameAr}
        tierIcon={tier.icon}
        points={userData?.points ?? 0}
        activeSection={activeSection}
        onClick={onCardClick}
      />
    </div>
  );
}