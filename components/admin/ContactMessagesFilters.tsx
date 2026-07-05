// C:\sawa-web\components\admin\ContactMessagesFilters.tsx

"use client";

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
}

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

const toDateInputValue = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseStartOfDay = (value: string): Date | null =>
  value ? new Date(`${value}T00:00:00`) : null;

const parseEndOfDay = (value: string): Date | null =>
  value ? new Date(`${value}T23:59:59.999`) : null;

export default function ContactMessagesFilters({
  filters,
  onChange,
}: ContactMessagesFiltersProps) {
  const handleReset = () => onChange(DEFAULT_FILTERS);

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* الحالة */}
        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              status: (e.target.value || null) as ContactMessageStatus | null,
            })
          }
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3c6e] bg-white"
        >
          <option value="">كل الحالات</option>
          {statusEntries.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* التصنيف */}
        <select
          value={filters.category ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              category: (e.target.value || null) as ContactMessageCategory | null,
            })
          }
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3c6e] bg-white"
        >
          <option value="">كل التصنيفات</option>
          {categoryEntries.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* التاريخ */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-500">من:</label>
          <input
            type="date"
            value={toDateInputValue(filters.dateFrom)}
            onChange={(e) =>
              onChange({ ...filters, dateFrom: parseStartOfDay(e.target.value) })
            }
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#1a3c6e] [direction:ltr]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-500">إلى:</label>
          <input
            type="date"
            value={toDateInputValue(filters.dateTo)}
            onChange={(e) =>
              onChange({ ...filters, dateTo: parseEndOfDay(e.target.value) })
            }
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#1a3c6e] [direction:ltr]"
          />
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-[#c9a84c] hover:text-[#b8973b] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#c9a84c]/10 transition md:mr-auto"
        >
          إعادة ضبط
        </button>
      </div>
    </div>
  );
}