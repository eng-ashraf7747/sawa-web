"use client";
import Image from "next/image";
import { useCity } from "@/hooks/useCity";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const { selectedCity, cityOpen, setCityOpen, selectCity, cities } = useCity();
  const { user } = useAuth();

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#0d2447] text-white/75 text-center py-2 px-6 text-xs tracking-wide">
        🌍 SAWA متاحة دلوقتي في{" "}
        <span className="text-[#f0d980] font-semibold">{selectedCity.nameAr}</span>{" "}
        — وقريباً في محافظات أكتر
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e8eaed] px-12 h-16 flex items-center justify-between gap-6">
        <a href="/" className="flex items-center flex-shrink-0">
          <Image src="/Sawa-logo.png" alt="SAWA" width={120} height={42} priority />
        </a>

        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {["الخدمات", "كيف تعمل؟", "العضوية", "لأصحاب الأعمال"].map((item, i) => (
            <a key={i} href="#"
              className="text-sm text-[#6b7280] px-3 py-2 rounded-lg hover:text-[#111827] hover:bg-[#f8f9fb] transition-all whitespace-nowrap flex items-center gap-1">
              {item}
              {i === 0 && (
                <span className="text-[10px] bg-[#c9a84c] text-[#1a3c6e] px-1.5 py-0.5 rounded-full font-bold">
                  قريباً
                </span>
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" dir="ltr">
          <button
            onClick={() => setCityOpen(!cityOpen)}
            className="flex items-center gap-1.5 border border-[#e8eaed] rounded-full px-3 py-1.5 text-xs text-[#111827] bg-white hover:border-[#1a3c6e] transition-colors cursor-pointer"
          >
            <svg className="w-3 h-3 text-[#6b7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {selectedCity.nameAr}
            <svg className="w-3 h-3 text-[#6b7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <div className="w-px h-5 bg-[#e8eaed]"/>
          {user ? (
            <span className="text-sm font-semibold text-[#1a3c6e]">
              {user.displayName || user.email}
            </span>
          ) : (
            <button
              onClick={onLoginClick}
              className="text-sm text-[#111827] px-4 py-1.5 rounded-lg hover:bg-[#f8f9fb] hover:text-[#1a3c6e] transition-all font-semibold cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* CITY DROPDOWN */}
      {cityOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setCityOpen(false)}>
          <div
            className="absolute top-16 left-12 bg-white rounded-2xl shadow-2xl p-5 min-w-[220px]"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-widest mb-3">
              Select City
            </h3>
            {cities.map((city) => (
              <div
                key={city.id}
                onClick={() => selectCity(city)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  city.id === selectedCity.id ? "bg-blue-50" : "hover:bg-[#f8f9fb]"
                }`}
              >
                <span className="text-sm text-[#111827]">{city.nameAr}</span>
                {city.id === selectedCity.id && <span className="text-[#1a3c6e]">✓</span>}
                {!city.available && (
                  <span className="text-[10px] bg-[#f8f9fb] text-[#6b7280] px-1.5 py-0.5 rounded-full font-bold">
                    SOON
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}