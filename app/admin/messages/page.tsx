// C:\sawa-web\app\admin\messages\page.tsx

"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useContactMessages } from "@/hooks/useContactMessages";
import ContactMessagesFilters from "@/components/admin/ContactMessagesFilters";
import ContactMessagesTable from "@/components/admin/ContactMessagesTable";
import { ContactMessageFilters } from "@/types/contact";

const DEFAULT_FILTERS: ContactMessageFilters = {
  status: null,
  category: null,
  dateFrom: null,
  dateTo: null,
};

export default function AdminMessagesPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const [filters, setFilters] = useState<ContactMessageFilters>(DEFAULT_FILTERS);
  const { messages, loading, error, updating, reload, updateMessage } =
    useContactMessages(filters);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <AdminLayout title="رسائل التواصل">
      <div className="px-4 md:px-6 lg:px-8 py-6" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0f172a]">رسائل التواصل</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {messages.length} رسالة مطابقة للفلاتر الحالية
            </p>
          </div>
          <button onClick={reload} className="text-xs text-[#1a3c6e] hover:underline">
            تحديث
          </button>
        </div>

        <ContactMessagesFilters filters={filters} onChange={setFilters} />

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <ContactMessagesTable
            messages={messages}
            onUpdate={updateMessage}
            updating={updating}
          />
        )}
      </div>
    </AdminLayout>
  );
}