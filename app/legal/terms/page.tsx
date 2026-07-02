// C:\sawa-web\app\legal\terms\page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { LEGAL_TERMS, LEGAL_TERMS_LAST_UPDATED } from "@/constants/legalTerms";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState <string>("");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const sectionRefs = useRef <Record <string, HTMLElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      for (const section of LEGAL_TERMS) {
        const el = sectionRefs.current[section.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = section.id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl" id="top">

      {/* ─── هيدر مبسط ─────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 lg:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <img src="/Sawa-logo.png" alt="سوا" className="h-8" />
            <span className="text-[#1a3c6e] font-bold text-lg hidden sm:inline">سوا</span>
          </a>
          <h1 className="text-[#1a3c6e] font-bold text-sm md:text-base">شروط الاستخدام</h1>
        </div>
      </header>

      {/* ─── زر الفهرس العائم — موبايل فقط ─────────────── */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setMobileTocOpen(!mobileTocOpen)}
          className="bg-[#1a3c6e] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition hover:bg-[#15306a]"
          aria-label="فهرس المحتوى"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ─── قائمة الفهرس المنبثقة — موبايل فقط ──────────── */}
      {mobileTocOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileTocOpen(false)}>
          <div
            className="absolute bottom-32 right-4 bg-white rounded-2xl shadow-xl p-4 w-72 max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-[#c9a84c] hover:underline mb-3 pb-3 border-b border-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة للموقع
            </a>
            <nav className="space-y-0.5">
              {LEGAL_TERMS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setMobileTocOpen(false)}
                  className={`flex items-start gap-2.5 text-sm py-2 px-2 rounded-lg transition ${
                    activeSection === section.id
                      ? "bg-[#1a3c6e]/10 text-[#1a3c6e] font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    activeSection === section.id ? "bg-[#c9a84c]" : "bg-gray-300"
                  }`} />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ─── التخطيط الرئيسي ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 flex gap-8">

        {/* ─── المحتوى ──────────────────────────────────── */}
        <main className="flex-1 min-w-0 max-w-[800px] mx-auto lg:mx-0">
          <p className="text-xs text-gray-400 mb-4">آخر تحديث: {LEGAL_TERMS_LAST_UPDATED}</p>

          <div className="space-y-6">
            {LEGAL_TERMS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 scroll-mt-16"
              >
                <h2 className="text-[#1a3c6e] font-bold text-base md:text-lg mb-3">
                  {section.title}
                </h2>
                <div className="text-gray-600 text-sm md:text-base leading-relaxed md:leading-loose whitespace-pre-line">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center pt-6">
            جميع الحقوق محفوظة لمنصة سوا &copy; {new Date().getFullYear()}
          </p>
        </main>

        {/* ─── الفهرس الجانبي — ديسكتوب فقط ────────────── */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-16">
            <a
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-[#c9a84c] hover:underline mb-4 pb-4 border-b border-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة للموقع
            </a>

            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-semibold">فهرس المحتوى</p>

            <nav className="space-y-0.5">
              {LEGAL_TERMS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`flex items-start gap-2.5 text-sm py-2 px-2 rounded-lg transition ${
                    activeSection === section.id
                      ? "bg-[#1a3c6e]/10 text-[#1a3c6e] font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 transition-colors ${
                    activeSection === section.id ? "bg-[#c9a84c]" : "bg-gray-300"
                  }`} />
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

      </div>

      {/* ─── زر العودة للأعلى ───────────────────────────── */}
      <a
        href="#top"
        className="fixed bottom-6 left-6 md:bottom-8 md:left-8 bg-[#1a3c6e] hover:bg-[#15306a] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transition z-50"
        aria-label="العودة للأعلى"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </a>

    </div>
  );
}