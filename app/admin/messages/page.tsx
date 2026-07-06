// C:\sawa-web\app\admin\messages\page.tsx
"use client";
import { useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useContactMessages } from "@/hooks/useContactMessages";
import ContactMessagesFilters from "@/components/admin/ContactMessagesFilters";
import ContactMessagesTable from "@/components/admin/ContactMessagesTable";
import { ContactMessageFilters } from "@/types/contact";

const DEFAULT_FILTERS: ContactMessageFilters = {
  status: null,
  category: null,
  senderType: null,
  dateFrom: null,
  dateTo: null,
};

export default function AdminMessagesPage() {
  const { isAuthorized, loading: authLoading } = useAdminGuard();
  const [filters, setFilters] = useState<ContactMessageFilters>(DEFAULT_FILTERS);

  const {
    messages,
    loading,
    error,
    updating,
    hasMore,
    loadMore,
    reload,
    updateMessage,
    deleteMessages,
  } = useContactMessages(filters);

  // Debounce لتغيير الفلاتر
  const handleFiltersChange = useCallback((newFilters: ContactMessageFilters) => {
    setFilters(newFilters);
  }, []);

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
              {messages.length} رسالة محملة حالياً
            </p>
          </div>
          <button
            onClick={reload}
            disabled={loading}
            className="text-xs text-[#1a3c6e] hover:underline disabled:opacity-50 font-medium"
          >
            تحديث القائمة
          </button>
        </div>

        <ContactMessagesFilters
          filters={filters}
          onChange={handleFiltersChange}
          loading={loading}
        />

        {loading && messages.length === 0 && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500 text-sm font-medium">{error}</div>
        )}

        {(!loading || messages.length > 0) && !error && (
          <div className="mt-6">
            <ContactMessagesTable
              messages={messages}
              loading={loading}
              updating={updating}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onUpdateStatus={updateMessage}
              onDeleteMessages={deleteMessages}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}