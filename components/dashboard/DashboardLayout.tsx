// C:\sawa-web\components\dashboard\DashboardLayout.tsx

"use client";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { mockRequests } from "@/lib/mockData";
import { useActiveCategories } from "@/hooks/useCategories";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import StatsBar from "./StatsBar";
import RequestsSection from "./RequestsSection";
import PointsSection from "./PointsSection";
import CategoryGrid from "@/components/home/CategoryGrid";

type ActiveSection = "home" | "deals" | "requests" | "points" | "profile" | string;

function MainContent({
  activeSection,
  onSectionChange,
  userData,
  categoriesCount,
}: {
  activeSection: ActiveSection;
  onSectionChange: (section: string) => void;
  userData: ReturnType<typeof useUser>["userData"];
  categoriesCount: number;
}) {
  const statsBar = (
    <StatsBar
      userData={userData}
      categoriesCount={categoriesCount}
      requestsCount={mockRequests.length}
      onCardClick={onSectionChange}
      activeSection={activeSection}
    />
  );

  if (activeSection === "deals") {
    return (
      <>
        {statsBar}
        <CategoryGrid columns={4} />
      </>
    );
  }
  if (activeSection === "requests") {
    return <>{statsBar}<RequestsSection requests={mockRequests} /></>;
  }
  if (activeSection === "points") {
    return <>{statsBar}<PointsSection userData={userData} /></>;
  }
  if (activeSection === "profile") {
    return (
      <>
        {statsBar}
        <div className="flex-1 bg-white rounded-2xl border border-[#e8eaed] shadow-sm min-h-[400px]" />
      </>
    );
  }

  return (
    <>
      {statsBar}
      <div className="flex gap-6">
        <CategoryGrid columns={2} />
        <RequestsSection requests={mockRequests} />
      </div>
    </>
  );
}

export default function DashboardLayout() {
  const { userData, loading } = useUser();
  const { categories } = useActiveCategories();
  const [activePage, setActivePage] = useState("home");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          <p className="text-[#1a3c6e] font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-row bg-[#f0f4f8]" dir="rtl">
      <Sidebar
        userData={userData}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <DashboardHeader userData={userData} activePage={activePage} />
        <main className="flex-1 p-8 flex flex-col gap-6">
          <MainContent
            activeSection={activePage}
            onSectionChange={setActivePage}
            userData={userData}
            categoriesCount={categories.length}
          />
        </main>
      </div>
    </div>
  );
}