// C:\sawa-web\components\admin\ContactMessagesTable.tsx

"use client";

import { Fragment, useEffect, useRef, useState } from "react";
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
  onUpdate: (messageId: string, input: UpdateContactMessageInput) => Promise<void>;
  updating: boolean;
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
  onUpdate,
  updating,
}: ContactMessagesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<ContactMessageStatus>("new");
  const [draftNotes, setDraftNotes] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleToggleRow = (message: ContactMessage) => {
    if (expandedId === message.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(message.id);
    setDraftStatus(message.status);
    setDraftNotes(message.adminNotes ?? "");
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
    message: ContactMessage
  ) => {
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
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedId((current) => (current === messageId ? null : current));
      }, 1500);
    } catch {
      console.error("Failed to copy contact value.");
    }
  };

  const handleSave = async () => {
    if (!expandedId || updating) return;

    const current = messages.find((m) => m.id === expandedId);
    if (!current) return;

    const normalizedNotes = draftNotes.trim() || null;
    if (current.status === draftStatus && (current.adminNotes ?? null) === normalizedNotes) {
      return;
    }

    await onUpdate(current.id, { status: draftStatus, adminNotes: normalizedNotes });
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 py-16 text-center">
        <div className="text-3xl mb-2">📭</div>
        <p className="text-sm text-slate-400">لا توجد رسائل مطابقة للفلاتر الحالية</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden" dir="rtl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs">
              <th className="text-right font-semibold px-4 py-3">التاريخ</th>
              <th className="text-right font-semibold px-4 py-3">المرسل</th>
              <th className="text-right font-semibold px-4 py-3">التصنيف</th>
              <th className="text-right font-semibold px-4 py-3">الحالة</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <Fragment key={message.id}>
                <tr
                  role="button"
                  tabIndex={0}
                  onClick={() => handleToggleRow(message)}
                  onKeyDown={(e) => handleRowKeyDown(e, message)}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer transition focus:outline-none focus:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {dateFormatter.format(message.createdAt)}
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
                  <td className="px-4 py-3 text-slate-300">
                    {expandedId === message.id ? "▲" : "▼"}
                  </td>
                </tr>

                {expandedId === message.id && (
                  <tr>
                    <td colSpan={5} className="bg-slate-50/60 px-4 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-1">الرسالة</p>
                          <p className="text-sm text-[#0d2447] whitespace-pre-wrap leading-relaxed">
                            {message.message}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-400 mb-1">
                              وسيلة التواصل
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#0d2447] [direction:ltr] inline-block">
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
                                className="text-xs text-[#1a3c6e] hover:underline"
                              >
                                {copiedId === message.id ? "تم النسخ ✓" : "نسخ"}
                              </button>
                            </div>
                          </div>

                          {message.city && (
                            <div>
                              <p className="text-xs font-semibold text-slate-400 mb-1">المدينة</p>
                              <p className="text-sm text-[#0d2447]">{message.city}</p>
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-semibold text-slate-400 mb-1">الحالة</p>
                            <select
                              value={draftStatus}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setDraftStatus(e.target.value as ContactMessageStatus)}
                              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1a3c6e]"
                            >
                              {statusEntries.map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-400 mb-1">
                              ملاحظات الأدمن
                            </p>
                            <textarea
                              value={draftNotes}
                              rows={2}
                              placeholder="ملاحظة داخلية (لا تصل للمرسل)"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setDraftNotes(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm resize-none focus:outline-none focus:border-[#1a3c6e]"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={updating}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleSave();
                            }}
                            className="bg-[#1a3c6e] text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#15306a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updating ? "جاري الحفظ..." : "حفظ التغييرات"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}