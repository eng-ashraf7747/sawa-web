// C:\sawa-web\app\admin\settings\page.tsx

"use client";

import { useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useCities } from "@/hooks/useCities";
import AdminLayout from "@/components/admin/AdminLayout";

type SettingsSection = "cities" | "managers" | "commission" | "points";

interface SectionConfig {
  id: SettingsSection;
  label: string;
  enabled: boolean;
}

const SECTIONS: SectionConfig[] = [
  { id: "cities", label: "إدارة المحافظات", enabled: true },
  { id: "managers", label: "إدارة المديرين", enabled: false },
  { id: "commission", label: "إعدادات العمولة", enabled: false },
  { id: "points", label: "إعدادات النقاط", enabled: false },
];

/**
 * نسخة مصغَّرة من شارة "قيد الإنشاء" (نفس هوية components/shared/UnderConstruction.tsx
 * البصرية بالضبط) لكن بدون زر "العودة للرئيسية" — غير مناسب هنا لأنه سيُخرج
 * الأدمن من لوحة الإدارة بالكامل. تُستخدم فقط داخل تبويبات هذه الصفحة.
 */
function SectionUnderConstruction({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="w-14 h-14 rounded-2xl bg-[#f8f9fb] border border-[#e8eaed] flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-[#c9a84c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>
      <span className="text-[10px] font-bold bg-[#c9a84c] text-[#1a3c6e] px-2.5 py-1 rounded-full mb-3">
        قيد الإنشاء
      </span>
      <h2 className="text-base font-bold text-[#0d2447] mb-1">{label}</h2>
      <p className="text-sm text-[#6b7280] max-w-sm">
        هذا القسم قيد التجهيز حالياً، وسيتم تفعيله قريباً.
      </p>
    </div>
  );
}

/**
 * محتوى قسم "إدارة المحافظات" — عرض للقراءة فقط في هذه المرحلة (الهيكل العام).
 * أزرار التفعيل/التعطيل الفعلية تُضاف في الخطوة التالية من نفس الخطة.
 */
function CitiesSection() {
  const { cities, loading } = useCities();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-bold text-[#0d2447] mb-1">إدارة المحافظات</h2>
      <p className="text-sm text-[#6b7280] mb-6">
        قائمة المحافظات المتاحة للمنصة حالياً
      </p>
      <div className="space-y-2">
        {cities.map((city) => (
          <div
            key={city.id}
            className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3"
          >
            <span className="text-sm font-medium text-slate-700">{city.nameAr}</span>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                city.available
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {city.available ? "نشطة" : "قريباً"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const [activeSection, setActiveSection] = useState<SettingsSection>("cities");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  const activeConfig = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <AdminLayout title="الإعدادات">
      <div className="flex flex-col md:flex-row gap-6">
        {/* قائمة الأقسام */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-right transition-colors ${
                  activeSection === section.id
                    ? "bg-[#1a3c6e] text-white font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{section.label}</span>
                {!section.enabled && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeSection === section.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    قريباً
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* محتوى القسم المختار */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          {activeConfig.enabled ? (
            <CitiesSection />
          ) : (
            <SectionUnderConstruction label={activeConfig.label} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}