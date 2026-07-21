// C:\sawa-web\components\dashboard\Sidebar.tsx

"use client";

import { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { User } from "@/types";
import { TIERS } from "@/constants";

interface SidebarProps {
  userData: User | null;
  activePage: string;
  onNavigate: (page: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const NavItem = memo(function NavItem({
  id,
  icon,
  label,
  isActive,
  isChild = false,
  onClick,
}: {
  id: string;
  icon?: string;
  label: string;
  isActive: boolean;
  isChild?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
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
});

export default function Sidebar({
  userData,
  activePage,
  onNavigate,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const router = useRouter();
  const [servicesOpen, setServicesOpen] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const tierKey = userData?.tier ?? "bronze";
  const tier = TIERS[tierKey] || TIERS.bronze;
  const hasAvatarPhoto = Boolean(userData?.photoURL) && !avatarLoadFailed;

  const handleLogout = async () => {
    const confirmed = window.confirm("هل أنت متأكد من رغبتك في تسجيل الخروج؟");
    if (!confirmed) return;
    await logout();
    router.push("/");
  };

  // ملاحظة معمارية (20 يوليو 2026): نفس عنصر النقل يُستدعى مرة واحدة
  // بمنطقه الكامل، ويُعرَض مرتين فقط عبر تغيير الحاوية الخارجية —
  // مرة كشريط ثابت لسطح المكتب (aside عادي)، ومرة كـ overlay كامل
  // الشاشة على الموبايل (يظهر فقط عند isMobileOpen). هذا يمنع ازدواجية
  // منطق التنقل نفسه في مكانين، ويقتصر الفرق على "كيف يُعرَض الحاوي".
  const navigationContent = (
    <>
      {/* Logo */}
      <div className="flex justify-center items-center py-6 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
          <Image
            src="/Sawa-logo.png"
            alt="SAWA"
            width={140}
            height={80}
            className="object-contain"
            priority
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>

      {/* User Profile */}
      <div className="flex flex-col items-center py-6 px-4 border-b border-white/10">
        <div
          className="w-16 h-16 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-2xl mb-3"
          style={{ border: `2px solid ${tier.color}` }}
        >
          {hasAvatarPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- رابط خارجي ديناميكي من Firebase Storage؛ next/image يتطلب images.remotePatterns غير مُعدّة حاليًا في next.config.ts
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
        <p className="font-bold text-base" style={{ color: tier.color }}>
          {userData?.displayName ?? "مستخدم"}
        </p>
        <span
          className="text-xs px-3 py-1 rounded-full mt-1 font-semibold"
          style={{ backgroundColor: `${tier.color}22`, color: tier.color }}
        >
          {tier.nameAr} ⭐
        </span>
        <p className="text-white/60 text-xs mt-2">
          {userData?.points ?? 0} نقطة
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        <NavItem
          id="home"
          icon="🏠"
          label="الرئيسية"
          isActive={activePage === "home"}
          onClick={() => { onNavigate("home"); onMobileClose(); }}
        />

        {/* Services Section */}
        <button
          onClick={() => setServicesOpen((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          aria-expanded={servicesOpen}
        >
          <span className="flex items-center gap-3">
            <span>🎯</span>
            <span className="text-sm">الخدمات</span>
          </span>
          <span className="text-xs">{servicesOpen ? "▲" : "▼"}</span>
        </button>

        {servicesOpen && (
          <div className="flex flex-col gap-0.5">
            <NavItem id="deals" label="العروض المتاحة" isActive={activePage === "deals"} isChild onClick={() => { onNavigate("deals"); onMobileClose(); }} />
            <NavItem id="requests" label="الخدمات المطلوبة" isActive={activePage === "requests"} isChild onClick={() => { onNavigate("requests"); onMobileClose(); }} />
            <NavItem id="bookings" label="حجوزاتي" isActive={activePage === "bookings"} isChild onClick={() => { onNavigate("bookings"); onMobileClose(); }} />
          </div>
        )}

        {/* Account Section */}
        <button
          onClick={() => setAccountOpen((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          aria-expanded={accountOpen}
        >
          <span className="flex items-center gap-3">
            <span>👤</span>
            <span className="text-sm">حسابي</span>
          </span>
          <span className="text-xs">{accountOpen ? "▲" : "▼"}</span>
        </button>

        {accountOpen && (
          <div className="flex flex-col gap-0.5">
            <NavItem id="profile" label="بياناتي" isActive={activePage === "profile"} isChild onClick={() => { onNavigate("profile"); onMobileClose(); }} />
            <NavItem id="points" label="سجل نقاطي" isActive={activePage === "points"} isChild onClick={() => { onNavigate("points"); onMobileClose(); }} />

            <Link href="/contact" onClick={onMobileClose} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all pr-10 py-2">
              💬 تواصل معنا
            </Link>
            <Link href="/legal/terms" onClick={onMobileClose} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all pr-10 py-2">
              📄 شروط الاستخدام
            </Link>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all cursor-pointer"
          aria-label="تسجيل الخروج"
        >
          <span>🚪</span>
          <span className="text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* سطح المكتب — شريط ثابت دائم الظهور، بلا تغيير عن السابق */}
      <aside
        className="hidden md:flex w-[260px] min-h-screen flex-col"
        style={{ background: "linear-gradient(180deg, #1a3c6e 0%, #0f2447 100%)" }}
        role="navigation"
        aria-label="القائمة الجانبية"
      >
        {navigationContent}
      </aside>

      {/* الموبايل — Overlay كامل الشاشة، يظهر فقط عند فتحه من زرار الهمبرجر */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside
            className="relative w-[280px] max-w-[80vw] h-full flex flex-col overflow-y-auto"
            style={{ background: "linear-gradient(180deg, #1a3c6e 0%, #0f2447 100%)" }}
            role="navigation"
            aria-label="القائمة الجانبية"
          >
            <button
              onClick={onMobileClose}
              className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="إغلاق القائمة"
            >
              ✕
            </button>
            {navigationContent}
          </aside>
        </div>
      )}
    </>
  );
}