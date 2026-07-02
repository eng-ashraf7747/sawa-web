// C:\sawa-web\app\legal\terms\page.tsx
"use client";

import { LEGAL_TERMS, LEGAL_TERMS_LAST_UPDATED } from "@/constants/legalTerms";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* ─── الهيدر ────────────────────────────────────── */}
      <div className="bg-[#1a3c6e] text-white px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">شروط استخدام منصة سوا</h1>
          <p className="text-white/70 text-sm">
            آخر تحديث: {LEGAL_TERMS_LAST_UPDATED}
          </p>
        </div>
      </div>

      {/* ─── المحتوى ──────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">

        {/* ─── الفهرس ──────────────────────────────────── */}
        <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-8">
          <h2 className="text-[#1a3c6e] font-bold text-sm mb-4">فهرس المحتوى</h2>
          <ol className="space-y-2">
            {LEGAL_TERMS.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-sm text-gray-600 hover:text-[#1a3c6e] transition underline-offset-2 hover:underline"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ─── البنود ──────────────────────────────────── */}
        <div className="space-y-6">
          {LEGAL_TERMS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 scroll-mt-24"
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

        {/* ─── تذييل ──────────────────────────────────── */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            جميع الحقوق محفوظة لمنصة سوا &copy; {new Date().getFullYear()}
          </p>
        </div>

      </div>

      {/* ─── زر رجوع للأعلى ───────────────────────────── */}
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