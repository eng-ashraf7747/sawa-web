// C:\sawa-web\components\admin\ContactMessagesTable.tsx
"use client";
import { Fragment, useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  ContactMessage,
  ContactMessageStatus,
  UpdateContactMessageInput,
  CONTACT_MESSAGE_STATUS_LABELS,
  CONTACT_MESSAGE_CATEGORY_LABELS,
  CONTACT_MESSAGE_METHOD_LABELS,
  CONTACT_MESSAGE_SENDER_TYPE_LABELS,
} from "@/types/contact";

interface ContactMessagesTableProps {
  messages: ContactMessage[];
  loading: boolean;
  updating: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onUpdateStatus: (id: string, input: UpdateContactMessageInput) => Promise<void>;
  onDeleteMessages: (ids: string[]) => Promise<void>;
}

const statusEntries = Object.entries(CONTACT_MESSAGE_STATUS_LABELS) as [
  ContactMessageStatus,
  string
][];

const DEFAULT_BADGE_STYLE = "bg-slate-100 text-slate-500";
const SENDER_TYPE_STYLES: Record<string, string> = {
  guest: "bg-slate-100 text-slate-500",
  user: "bg-blue-50 text-[#1a3c6e]",
  vendor: "bg-[#c9a84c]/15 text-[#8a6f2e]",
};
const STATUS_STYLES: Record<ContactMessageStatus, string> = {
  new: "bg-emerald-50 text-emerald-600",
  in_progress: "bg-amber-50 text-amber-600",
  resolved: "bg-slate-100 text-slate-500",
};

const dateFormatter = new Intl.DateTimeFormat("ar-EG", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function ContactMessagesTable({
  messages,
  loading,
  updating,
  hasMore,
  onLoadMore,
  onUpdateStatus,
  onDeleteMessages,
}: ContactMessagesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<ContactMessageStatus>("new");
  const [draftNotes, setDraftNotes] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoized values
  const allSelected = useMemo(() => {
    return messages.length > 0 && selectedIds.length === messages.length;
  }, [messages.length, selectedIds.length]);

  const handleSelectOne = useCallback((e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const currentIds = messages.map((m) => m.id);
    setSelectedIds((prev) =>
      prev.length === currentIds.length && currentIds.length > 0 ? [] : currentIds
    );
  }, [messages]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || updating || loading) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} رسالة؟`)) return;

    await onDeleteMessages(selectedIds);
    setSelectedIds([]);
    setExpandedId(null);
  };

  const handleToggleRow = useCallback((message: ContactMessage) => {
    if (expandedId === message.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(message.id);
    setDraftStatus(message.status);
    setDraftNotes(message.adminNotes ?? "");
  }, [expandedId]);

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, message: ContactMessage) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggleRow(message);
    }
  };

  const handleCopy = async (messageId: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(messageId);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 1500);
    } catch {
      console.error("Failed to copy");
    }
  };

  const handleSave = async () => {
    if (!expandedId || updating) return;

    const current = messages.find((m) => m.id === expandedId);
    if (!current) return;

    const normalizedNotes = draftNotes.trim() || null;
    if (current.status === draftStatus && (current.adminNotes ?? null) === normalizedNotes) {
      setExpandedId(null);
      return;
    }

    await onUpdateStatus(current.id, { status: draftStatus, adminNotes: normalizedNotes });
    setExpandedId(null); // إغلاق بعد الحفظ
  };

  // Empty state
  if (messages.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 py-16 text-center" dir="rtl">
        <div className="text-3xl mb-2">📭</div>
        <p className="text-sm text-slate-400">لا توجد رسائل مطابقة للفلاتر الحالية</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {selectedIds.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex justify-between items-center px-4 md:px-6">
          <span className="text-sm text-red-700 font-medium">
            تم تحديد {selectedIds.length} رسالة
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={updating || loading}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            حذف المحدد
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[768px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs bg-slate-50/50">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    disabled={loading || messages.length === 0}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                </th>
                <th className="text-right font-semibold px-4 py-3">التاريخ</th>
                <th className="text-right font-semibold px-4 py-3">المرسل</th>
                <th className="text-right font-semibold px-4 py-3">التصنيف</th>
                <th className="text-right font-semibold px-4 py-3">الحالة</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {messages.map((message) => {
                const isExpanded = expandedId === message.id;
                const isSelected = selectedIds.includes(message.id);

                return (
                  <Fragment key={message.id}>
                    <tr
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      onClick={() => handleToggleRow(message)}
                      onKeyDown={(e) => handleRowKeyDown(e, message)}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition ${
                        isExpanded ? "bg-slate-50/40" : ""
                      } ${isSelected ? "bg-emerald-50/20" : ""}`}
                    >
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(e, message.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {message.createdAt ? dateFormatter.format(new Date(message.createdAt)) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#0d2447]">
                            {message.name ?? "بدون اسم"}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              SENDER_TYPE_STYLES[message.senderType] ?? DEFAULT_BADGE_STYLE
                            }`}
                          >
                            {CONTACT_MESSAGE_SENDER_TYPE_LABELS[message.senderType]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {CONTACT_MESSAGE_CATEGORY_LABELS[message.category]}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            STATUS_STYLES[message.status] ?? DEFAULT_BADGE_STYLE
                          }`}
                        >
                          {CONTACT_MESSAGE_STATUS_LABELS[message.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-center text-xs">
                        {isExpanded ? "▲" : "▼"}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={6} className="px-6 py-5 border-b border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-slate-400">محتوى الرسالة</p>
                              <p className="text-sm text-[#0d2447] whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-slate-100">
                                {message.message}
                              </p>
                            </div>

                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 mb-1">وسيلة التواصل</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-[#0d2447] [direction:ltr]">
                                      {message.contactValue}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      ({CONTACT_MESSAGE_METHOD_LABELS[message.method]})
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void handleCopy(message.id, message.contactValue);
                                      }}
                                      className="text-xs text-[#1a3c6e] hover:underline font-medium ml-auto"
                                    >
                                      {copiedId === message.id ? "تم النسخ ✓" : "نسخ"}
                                    </button>
                                  </div>
                                </div>
                                {message.city && (
                                  <div className="pt-2 border-t border-slate-50">
                                    <p className="text-xs font-semibold text-slate-400 mb-0.5">المدينة</p>
                                    <p className="text-sm font-medium text-[#0d2447]">{message.city}</p>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-xs font-semibold text-slate-400">تحديث الحالة</label>
                                  <select
                                    value={draftStatus}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setDraftStatus(e.target.value as ContactMessageStatus)}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#1a3c6e]"
                                  >
                                    {statusEntries.map(([value, label]) => (
                                      <option key={value} value={value}>
                                        {label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-xs font-semibold text-slate-400">ملاحظات الأدمن</label>
                                  <textarea
                                    value={draftNotes}
                                    rows={3}
                                    placeholder="اكتب ملاحظة داخلية..."
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => setDraftNotes(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-y focus:border-[#1a3c6e]"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleSave();
                                  }}
                                  disabled={updating}
                                  className="bg-[#1a3c6e] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#15306a] disabled:opacity-50"
                                >
                                  {updating ? "جاري الحفظ..." : "حفظ التغييرات"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium transition disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? "جاري التحميل..." : "تحميل المزيد"}
          </button>
        </div>
      )}
    </div>
  );
}