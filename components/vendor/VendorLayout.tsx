// C:\sawa-web\components\vendor\VendorLayout.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const navItems = [
  {
    id: "overview",
    label: "لوحة التحكم",
    href: "/vendor/overview",
    mobileIcon: "🏠",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    enabled: true,
  },
  {
    id: "deals",
    label: "عروضي",
    href: "/vendor/deals",
    mobileIcon: "🏷️",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    enabled: true,
  },
  {
    id: "transactions",
    label: "سجل العمليات",
    href: "/vendor/transactions",
    mobileIcon: "📋",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    enabled: true,
  },
  {
    id: "reviews",
    label: "التقييمات",
    href: "/vendor/reviews",
    mobileIcon: "⭐",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    enabled: true,
  },
];

interface VendorLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function VendorLayout({ children, title }: VendorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { userData } = useUser();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex" dir="rtl">

      {/* ─── Desktop Sidebar (md+) ────────────────────────── */}
      <aside className={`
        hidden md:flex fixed top-0 right-0 h-full bg-[#1e293b] text-white z-30
        flex-col transition-all duration-300
        ${sidebarOpen ? "w-64" : "w-16"}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-[#c9a84c] font-bold text-xl">سوا</span>
              <span className="text-white/50 text-xs">بوابة المورد</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors mr-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.id} className="px-2 mb-1">
                {item.enabled ? (
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive
                        ? "bg-[#1a3c6e] text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <span className={isActive ? "text-[#c9a84c]" : ""}>{item.icon}</span>
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 cursor-not-allowed">
                    <span>{item.icon}</span>
                    {sidebarOpen && (
                      <div className="flex items-center justify-between flex-1">
                        <span className="text-sm">{item.label}</span>
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">قريباً</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Vendor Info + Dropdown */}
        <div className="border-t border-white/10 p-3 relative" ref={menuRef}>
          {menuOpen && (
            <div className={`
              absolute bottom-full mb-2 bg-[#0f172a] rounded-xl shadow-xl border border-white/10 overflow-hidden
              ${sidebarOpen ? "left-3 right-3" : "left-1 right-1"}
            `}>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {loggingOut ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
                {loggingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}
              </button>
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1a3c6e] flex items-center justify-center text-[#c9a84c] font-bold text-sm flex-shrink-0">
              {userData?.displayName?.charAt(0) ?? "V"}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-medium text-white truncate">{userData?.displayName ?? "المورد"}</p>
                  <p className="text-xs text-white/50 truncate">{userData?.email}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ─── Mobile Bottom Navigation ─────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 border-t border-white/10"
        style={{ background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)" }}
      >
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
              pathname === item.href ? "text-[#c9a84c]" : "text-white/60"
            }`}
          >
            <span className="text-xl">{item.mobileIcon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all text-red-300"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px]">خروج</span>
        </button>
      </nav>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "md:mr-64" : "md:mr-16"}`}>
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-6 py-4 shadow-sm">
          <h1 className="text-lg font-bold text-[#0f172a]">{title}</h1>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}