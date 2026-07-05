// C:\sawa-web\hooks\useContactMessages.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchContactMessages,
  fetchNewContactMessagesCount,
  updateContactMessage,
} from "@/lib/contact";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import {
  ContactMessage,
  ContactMessageFilters,
  UpdateContactMessageInput,
} from "@/types/contact";

const DEFAULT_FILTERS: ContactMessageFilters = {
  status: null,
  category: null,
  dateFrom: null,
  dateTo: null,
};

// ─── قائمة الرسائل مع الفلاتر (شاشة الأدمن) ──────────────────
export function useContactMessages(filters: ContactMessageFilters = DEFAULT_FILTERS) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { run: runUpdate, loading: updating } = useAsyncAction();

  const reload = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchContactMessages({
          status: filters.status,
          category: filters.category,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });
        if (!cancelled) setMessages(data);
      } catch {
        if (!cancelled) setError("تعذر تحميل الرسائل");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [filters.status, filters.category, filters.dateFrom, filters.dateTo, refreshKey]);

  const updateMessage = useCallback(
    async (messageId: string, input: UpdateContactMessageInput) => {
      await runUpdate(async () => {
        await updateContactMessage(messageId, input);
        reload();
      });
    },
    [runUpdate, reload]
  );

  return { messages, loading, error, updating, reload, updateMessage };
}

// ─── عدّاد الرسائل الجديدة (Badge في الـ Sidebar) ─────────────
export function useNewContactMessagesCount() {
  const [count, setCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadCount = async () => {
      try {
        const value = await fetchNewContactMessagesCount();
        if (!cancelled) setCount(value);
      } catch {
        // فشل صامت مقصود: فشل تحميل العدّاد لا يستحق إزعاج الأدمن بخطأ ظاهر
      }
    };

    loadCount();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { count, reload };
}