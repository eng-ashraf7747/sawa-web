// C:\sawa-web\components\admin\ContactMessagesFilters.tsx
"use client";

import { useCallback, useMemo, useState } from "react"; // ✅ أضفنا useState هنا
import {
  ContactMessageFilters,
  ContactMessageStatus,
  ContactMessageCategory,
  CONTACT_MESSAGE_STATUS_LABELS,
  CONTACT_MESSAGE_CATEGORY_LABELS,
} from "@/types/contact";

interface ContactMessagesFiltersProps {
  filters: ContactMessageFilters;
  onChange: (filters: ContactMessageFilters) => void;
  className?: string;
}

// استخدام null بدلاً من undefined لتوافق مع الـ types
const DEFAULT_FILTERS: ContactMessageFilters = {
  status: null,
  category: null,
  dateFrom: null,
  dateTo: null,
};

const statusEntries = Object.entries(CONTACT_MESSAGE_STATUS_LABELS) as [
  ContactMessageStatus,
  string
][];

const categoryEntries = Object.entries(CONTACT_MESSAGE_CATEGORY_LABELS) as [
  ContactMessageCategory,
  string
][];

// دوال مساعدة للتواريخ - ترجع null بدلاً من undefined
const toDateInputValue = (date: Date | null | undefined): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

const parseStartOfDay = (value: string): Date | null => {
  if (!value) return null;
  
  try {
    const date = new Date(`${value}T00:00:00`);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const parseEndOfDay = (value: string): Date | null => {
  if (!value) return null;
  
  try {
    const date = new Date(`${value}T23:59:59.999`);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Custom Hook للفلاتر - استخدام null
export function useContactMessagesFilters(
  initialFilters?: Partial<ContactMessageFilters>
) {
  const [filters, setFilters] = useState<ContactMessageFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const updateFilter = useCallback(<K extends keyof ContactMessageFilters>(
    key: K,
    value: ContactMessageFilters[K]
  ) => {
    setFilters((prev: ContactMessageFilters) => ({ // ✅ أضفنا النوع هنا
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const isFilterActive = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== null && value !== undefined && value !== ""
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    isFilterActive,
  };
}

export default function ContactMessagesFilters({
  filters,
  onChange,
  className = "",
}: ContactMessagesFiltersProps) {
  // معالجات الأحداث - استخدام null بدلاً من undefined
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value || null;
      onChange({
        ...filters,
        status: value as ContactMessageStatus | null,
      });
    },
    [filters, onChange]
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value || null;
      onChange({
        ...filters,
        category: value as ContactMessageCategory | null,
      });
    },
    [filters, onChange]
  );

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...filters,
        dateFrom: parseStartOfDay(e.target.value),
      });
    },
    [filters, onChange]
  );

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...filters,
        dateTo: parseEndOfDay(e.target.value),
      });
    },
    [filters, onChange]
  );

  const handleReset = useCallback(() => {
    onChange(DEFAULT_FILTERS);
  }, [onChange]);

  // التحقق من وجود فلاتر نشطة - التحقق من null
  const isFilterActive = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== null && value !== undefined && value !== ""
    );
  }, [filters]);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-100 p-3 sm:p-4 mb-6 ${className}`}
      dir="rtl"
      role="search"
      aria-label="فلاتر رسائل التواصل"
    >
      {/* شبكة متجاوبة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-end">
        
        {/* الحالة */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="status-filter" className="block text-xs text-slate-500 mb-1">
            الحالة
          </label>
          <select
            id="status-filter"
            value={filters.status ?? ""}
            onChange={handleStatusChange}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/50 bg-white transition-colors"
          >
            <option value="">كل الحالات</option>
            {statusEntries.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* التصنيف */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="category-filter" className="block text-xs text-slate-500 mb-1">
            التصنيف
          </label>
          <select
            id="category-filter"
            value={filters.category ?? ""}
            onChange={handleCategoryChange}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/50 bg-white transition-colors"
          >
            <option value="">كل التصنيفات</option>
            {categoryEntries.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* مجموعة التواريخ */}
        <div className="sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="date-from-filter" className="block text-xs text-slate-500 mb-1">
              من
            </label>
            <input
              id="date-from-filter"
              type="date"
              value={toDateInputValue(filters.dateFrom)}
              onChange={handleDateFromChange}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/50 [direction:ltr] transition-colors"
              aria-label="تاريخ البداية"
              max={filters.dateTo ? toDateInputValue(filters.dateTo) : undefined}
            />
          </div>

          <div>
            <label htmlFor="date-to-filter" className="block text-xs text-slate-500 mb-1">
              إلى
            </label>
            <input
              id="date-to-filter"
              type="date"
              value={toDateInputValue(filters.dateTo)}
              onChange={handleDateToChange}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3c6e]/50 [direction:ltr] transition-colors"
              aria-label="تاريخ النهاية"
              min={filters.dateFrom ? toDateInputValue(filters.dateFrom) : undefined}
            />
          </div>
        </div>

        {/* زر إعادة الضبط */}
        <div className="sm:col-span-2 lg:col-span-1 flex items-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isFilterActive}
            className={`w-full sm:w-auto text-xs font-semibold px-4 py-2 rounded-lg transition
              ${
                isFilterActive
                  ? "text-[#c9a84c] hover:text-[#b8973b] hover:bg-[#c9a84c]/10"
                  : "text-slate-300 cursor-not-allowed"
              }
            `}
            aria-label="إعادة ضبط الفلاتر"
          >
            إعادة ضبط
          </button>
        </div>
      </div>

      {/* ملخص الفلاتر النشطة */}
      {isFilterActive && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="font-medium">الفلاتر النشطة:</span>
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <span className="bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
                {CONTACT_MESSAGE_STATUS_LABELS[filters.status]}
              </span>
            )}
            {filters.category && (
              <span className="bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
                {CONTACT_MESSAGE_CATEGORY_LABELS[filters.category]}
              </span>
            )}
            {filters.dateFrom && (
              <span className="bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
                من: {toDateInputValue(filters.dateFrom)}
              </span>
            )}
            {filters.dateTo && (
              <span className="bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
                إلى: {toDateInputValue(filters.dateTo)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}