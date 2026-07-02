// C:\sawa-web\components\shared\BookingsFilters.tsx

"use client";

import { useState, useEffect } from "react";
import { filterBookings, getDefaultDateRange } from "@/lib/bookings";
import { BOOKING_STATUS_LABELS } from "@/types/booking";

interface BookingsFiltersProps {
  allBookings: any[]; // سيتم استبدال any[] بنوع Booking[] لاحقاً
  onFilterChange: (filteredBookings: any[]) => void;
}

const DEFAULT_STATUSES = ["pending", "delivered", "completed", "cancelled"];

export default function BookingsFilters({ allBookings, onFilterChange }: BookingsFiltersProps) {
  const defaultRange = getDefaultDateRange();

  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(DEFAULT_STATUSES);

  useEffect(() => {
    const filtered = filterBookings(allBookings, selectedStatuses, fromDate, toDate);
    onFilterChange(filtered);
  }, [allBookings, selectedStatuses, fromDate, toDate, onFilterChange]);

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleReset = () => {
    const resetRange = getDefaultDateRange();
    setFromDate(resetRange.from);
    setToDate(resetRange.to);
    setSelectedStatuses(DEFAULT_STATUSES);
  };

  const statusOptions = [
    { key: "pending", label: BOOKING_STATUS_LABELS.pending },
    { key: "delivered", label: BOOKING_STATUS_LABELS.delivered },
    { key: "completed", label: BOOKING_STATUS_LABELS.completed },
    { key: "cancelled", label: BOOKING_STATUS_LABELS.cancelled },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* ─── Checkboxes ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {statusOptions.map((opt) => (
            <label
              key={opt.key}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-sm
                ${selectedStatuses.includes(opt.key)
                  ? "bg-[#1a3c6e]/5 border-[#1a3c6e] text-[#1a3c6e] font-semibold"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
            >
              <input
                type="checkbox"
                checked={selectedStatuses.includes(opt.key)}
                onChange={() => handleStatusToggle(opt.key)}
                className="accent-[#1a3c6e] w-4 h-4"
              />
              <span className="text-xs">{opt.label}</span>
            </label>
          ))}
        </div>

        {/* ─── Dates + Reset ─── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">من:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#1a3c6e] [direction:ltr]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500">إلى:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#1a3c6e] [direction:ltr]"
            />
          </div>
          
          <button
            onClick={handleReset}
            className="text-xs text-[#c9a84c] hover:text-[#b8973b] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#c9a84c]/10 transition"
          >
            إعادة ضبط
          </button>
        </div>

      </div>
    </div>
  );
}