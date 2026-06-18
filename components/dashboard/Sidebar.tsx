"use client";
import { useState } from "react";
import Image from "next/image";
import { logout } from "@/lib/auth";
import { User } from "@/types";

interface SidebarProps {
  userData: User | null;
  activePage: string;
  onNavigate: (page: string) => void;
}

const tierColors: Record<string, string> = {
  bronze: "#cd7f32",
  silver: "#c0c0c0",
  gold: "#c9a84c",
  diamond: "#E8F4FD",
};

const tierNames: Record<string, string> = {
  bronze: "برونزي",
  silver: "فضي",
  gold: "ذهبي",
  diamond: "ماسي",
};

export default function Sidebar({ userData, activePage, onNavigate }: SidebarProps) {
  const [servicesOpen, setServicesOpen] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);

  const tierColor = tierColors[userData?.tier ?? "bronze"];
  const tierName = tierNames[userData?.tier ?? "bronze"];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const NavItem = ({
    id,
    icon,
    label,
    onClick,
    isChild = false,
  }: {
    id: string;
    icon?: string;
    label: string;
    onClick: () => void;
    isChild?: boolean;
  }) => {
    const isActive = activePage === id;
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-right cursor-pointer
          ${isChild ? "pr-10 py-2" : ""}
          ${isActive
            ? "bg-white text-[#1a3c6e] font-bold border-r-4 border-[#c9a84c]"
            : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
      >
        {icon && <span className="text-base">{icon}</span>}
        <span className={`text-sm ${isChild ? "text-xs" : ""}`}>{label}</span>
      </button>
    );
  };

  return (
    <aside
      className="w-[260px] min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #1a3c6e 0%, #0f2447 100%)" }}
    >
      {/* ─── Logo ─────────────────────────────────────────── */}
      <div className="flex justify-center items-center py-6 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
          <Image
            src="/Sawa-logo.png"
            alt="SAWA"
            width={140}
            height={80}
            className="object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>

      {/* ─── User Profile ─────────────────────────────────── */}
      <div className="flex flex-col items-center py-6 px-4 border-b border-white/10">
        <div
          className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl mb-3"
          style={{ border: `2px solid ${tierColor}` }}
        >
          👤
        </div>
        <p className="font-bold text-base" style={{ color: tierColor }}>
          {userData?.displayName ?? "مستخدم"}
        </p>
        <span
          className="text-xs px-3 py-1 rounded-full mt-1 font-semibold"
          style={{ backgroundColor: `${tierColor}22`, color: tierColor }}
        >
          {tierName} ⭐
        </span>
        <p className="text-white/60 text-xs mt-2">
          {userData?.points ?? 0} نقطة
        </p>
      </div>

      {/* ─── Navigation ───────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <NavItem id="home" icon="🏠" label="الرئيسية" onClick={() => onNavigate("home")} />

        {/* الخدمات */}
        <button
          onClick={() => setServicesOpen(!servicesOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <span>🎯</span>
            <span className="text-sm">الخدمات</span>
          </span>
          <span className="text-xs">{servicesOpen ? "▲" : "▼"}</span>
        </button>
        {servicesOpen && (
          <div className="flex flex-col gap-0.5">
            <NavItem id="deals" label="العروض المتاحة" onClick={() => onNavigate("deals")} isChild />
            <NavItem id="requests" label="الخدمات المطلوبة" onClick={() => onNavigate("requests")} isChild />
          </div>
        )}

        {/* حسابي */}
        <button
          onClick={() => setAccountOpen(!accountOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <span>👤</span>
            <span className="text-sm">حسابي</span>
          </span>
          <span className="text-xs">{accountOpen ? "▲" : "▼"}</span>
        </button>
        {accountOpen && (
          <div className="flex flex-col gap-0.5">
            <NavItem id="profile" label="بياناتي" onClick={() => onNavigate("profile")} isChild />
            <NavItem id="points" label="سجل نقاطي" onClick={() => onNavigate("points")} isChild />
          </div>
        )}
      </nav>

      {/* ─── Logout ───────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all cursor-pointer"
        >
          <span>🚪</span>
          <span className="text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}