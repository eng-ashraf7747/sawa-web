// C:\sawa-web\components\admin\ContactMessagesFilters.tsx
"use client";
import { ContactMessageFilters } from "@/types/contact";

interface ContactMessagesFiltersProps {
  filters: ContactMessageFilters;
  onChange: (filters: ContactMessageFilters) => void;
  loading?: boolean;
}

export default function ContactMessagesFilters({
  filters,
  onChange,
  loading = false,
}: ContactMessagesFiltersProps) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value === "all" ? null : value,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value ? new Date(value) : null,
    });
  };

  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const resetFilters = () => {
    onChange({
      status: null,
      category: null,
      senderType: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  return (
    <div
      dir="rtl"
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end px-4 md:px-6 lg:px-8"
    >
      {/* حالة الرسالة */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="status" className="text-xs font-medium text-gray-500 font-sans">
          حالة الرسالة
        </label>
        <select
          id="status"
          name="status"
          value={filters.status ?? "all"}
          onChange={handleSelectChange}
          disabled={loading}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-70"
        >
          <option value="all">كل الحالات</option>
          <option value="new">جديد</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="resolved">تم الحل</option>
        </select>
      </div>

      {/* تصنيف المحتوى */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="category" className="text-xs font-medium text-gray-500">
          تصنيف المحتوى
        </label>
        <select
          id="category"
          name="category"
          value={filters.category ?? "all"}
          onChange={handleSelectChange}
          disabled={loading}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-70"
        >
          <option value="all">كل التصنيفات</option>
          <option value="general_inquiry">استفسار عام</option>
          <option value="technical_issue">مشكلة تقنية</option>
          <option value="vendor_request">طلب انضمام كمورد</option>
          <option value="complaint">شكوى أو بلاغ</option>
          <option value="suggestion">اقتراح لتطوير المنصة</option>
          <option value="other">أخرى</option>
        </select>
      </div>

      {/* نوع المرسل */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="senderType" className="text-xs font-medium text-gray-500">
          نوع المرسل
        </label>
        <select
          id="senderType"
          name="senderType"
          value={filters.senderType ?? "all"}
          onChange={handleSelectChange}
          disabled={loading}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-70"
        >
          <option value="all">كل الأنواع</option>
          <option value="guest">زائر (غير مسجل)</option>
          <option value="user">مستخدم (عميل)</option>
          <option value="vendor">مورد (صاحب عرض)</option>
        </select>
      </div>

      {/* من تاريخ */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="dateFrom" className="text-xs font-medium text-gray-500">
          من تاريخ
        </label>
        <input
          id="dateFrom"
          name="dateFrom"
          type="date"
          value={formatDateForInput(filters.dateFrom)}
          onChange={handleDateChange}
          disabled={loading}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-70"
        />
      </div>

      {/* إلى تاريخ */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="dateTo" className="text-xs font-medium text-gray-500">
          إلى تاريخ
        </label>
        <input
          id="dateTo"
          name="dateTo"
          type="date"
          value={formatDateForInput(filters.dateTo)}
          onChange={handleDateChange}
          disabled={loading}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-70"
        />
      </div>

      {/* زر مسح الفلاتر */}
      <div className="flex flex-col gap-1.5 w-full lg:col-span-1">
        <button
          onClick={resetFilters}
          disabled={loading}
          className="mt-auto px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-70"
        >
          مسح الفلاتر
        </button>
      </div>
    </div>
  );
}