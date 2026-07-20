// C:\sawa-web\components\layout\Navbar.tsx

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCity } from "@/hooks/useCity";
import { useAuth } from "@/hooks/useAuth";
import { NAV_LINKS } from "@/constants";

interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const { selectedCity, cityOpen, setCityOpen, selectCity, cities } = useCity();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // إغلاق القوائم المنبثقة بمفتاح Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setCityOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setCityOpen]);

  return (
    <>
      {/* ANNOUNCEMENT BAR — relative z-[60] + -mb-px: يطغى شعرة على حافة الـ nav لمنع أي بليد من اللوجو */}
      <div className="relative z-[60] -mb-px bg-[#0d2447] text-white/75 text-center py-2 px-4 text-xs tracking-wide">
        🌍 SAWA متاحة دلوقتي في{" "}
        <span className="text-[#f0d980] font-semibold">{selectedCity?.nameAr ?? "الفيوم"}</span>{" "}
        — وقريباً في محافظات أكتر
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e8eaed] px-4 md:px-12 h-16 flex items-center justify-between gap-3 md:gap-6">
        <Link
          href="/"
          className="flex items-center flex-shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
        >
          <Image src="/Sawa-logo.png" alt="SAWA" width={100} height={36} priority className="w-20 md:w-[120px]" />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#6b7280] px-3 py-2 rounded-lg hover:text-[#111827] hover:bg-[#f8f9fb] transition-all whitespace-nowrap flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
            >
              {link.labelAr}
              {link.badgeAr && (
                <span className="text-[10px] bg-[#c9a84c] text-[#1a3c6e] px-1.5 py-0.5 rounded-full font-bold">
                  {link.badgeAr}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" dir="ltr">
          <button
            onClick={() => setCityOpen(!cityOpen)}
            className="hidden sm:flex items-center gap-1.5 border border-[#e8eaed] rounded-full px-3 py-1.5 text-xs text-[#111827] bg-white hover:border-[#1a3c6e] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
          >
            <svg className="w-3 h-3 text-[#6b7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {selectedCity?.nameAr ?? "الفيوم"}
            <svg className="w-3 h-3 text-[#6b7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          <div className="hidden sm:block w-px h-5 bg-[#e8eaed]" />

          {user ? (
            <div className="text-sm font-semibold text-[#1a3c6e] px-3 py-1.5">
              {user.displayName || user.email?.split("@")[0]}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-sm text-[#111827] px-3 md:px-4 py-1.5 rounded-lg hover:bg-[#f8f9fb] hover:text-[#1a3c6e] transition-all font-semibold cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
            >
              تسجيل الدخول
            </button>
          )}

          {/* Mobile/Tablet Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#f8f9fb] transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
          >
            <svg className="w-5 h-5 text-[#111827]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileMenuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE/TABLET MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-16 inset-x-4 bg-white rounded-2xl shadow-2xl p-3 border border-[#e8eaed]"
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-[#111827] hover:bg-[#f8f9fb] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e]"
              >
                {link.labelAr}
                {link.badgeAr && (
                  <span className="text-[10px] bg-[#c9a84c] text-[#1a3c6e] px-1.5 py-0.5 rounded-full font-bold">
                    {link.badgeAr}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CITY DROPDOWN */}
      {cityOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setCityOpen(false)}>
          <div
            className="absolute top-16 left-4 md:left-12 bg-white rounded-2xl shadow-2xl p-5 min-w-[240px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-widest mb-3">
              اختر المدينة
            </h3>
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => {
                  selectCity(city);
                  setCityOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-right focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3c6e] ${
                  city.id === selectedCity?.id ? "bg-blue-50" : "hover:bg-[#f8f9fb]"
                }`}
              >
                <span className="text-sm text-[#111827]">{city.nameAr}</span>
                {city.id === selectedCity?.id && <span className="text-[#1a3c6e]">✓</span>}
                {!city.available && (
                  <span className="text-[10px] bg-[#f8f9fb] text-[#6b7280] px-1.5 py-0.5 rounded-full font-bold">
                    قريباً
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}