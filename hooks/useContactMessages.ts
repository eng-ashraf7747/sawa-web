// C:\sawa-web\hooks\useContactMessages.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchContactMessages,
  updateContactMessage,
  deleteContactMessagesBatch,
} from "@/lib/contact";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import {
  ContactMessage,
  ContactMessageFilters,
  UpdateContactMessageInput,
} from "@/types/contact";
import { DocumentSnapshot } from "firebase/firestore";

const DEFAULT_FILTERS: ContactMessageFilters = {
  status: null,
  category: null,
  senderType: null,
  dateFrom: null,
  dateTo: null,
};

export function useContactMessages(filters: ContactMessageFilters = DEFAULT_FILTERS) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const { run: runAction, loading: actionLoading } = useAsyncAction();

  const reload = useCallback(() => {
    setMessages([]);
    setLastDoc(null);
    setHasMore(true);
    setRefreshKey((prev) => prev + 1);
  }, []);

  const loadMessages = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    setError(null);
    try {
      const result = await fetchContactMessages({
        status: filters.status,
        category: filters.category,
        senderType: filters.senderType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        pageSize: 50,
        lastDoc: isLoadMore && lastDoc ? lastDoc : undefined,
      });

      if (result) {
        const newMessages = result.messages || [];
        if (isLoadMore) {
          setMessages((prev) => [...prev, ...newMessages]);
        } else {
          setMessages(newMessages);
        }
        setLastDoc(result.lastDoc || null);
        setHasMore(newMessages.length === 50);
      }
    } catch (err) {
      console.error("Error loading contact messages:", err);
      setError("تعذر تحميل الرسائل");
    } finally {
      if (!isLoadMore) setLoading(false);
    }
  }, [filters, lastDoc]);

  useEffect(() => {
    loadMessages(false);
  }, [filters.status, filters.category, filters.senderType, filters.dateFrom, filters.dateTo, refreshKey]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || !lastDoc) return;
    loadMessages(true);
  }, [loading, hasMore, lastDoc, loadMessages]);

  const updateMessage = useCallback(
    async (messageId: string, input: UpdateContactMessageInput) => {
      await runAction(async () => {
        await updateContactMessage(messageId, input);
        reload();
      });
    },
    [runAction, reload]
  );

  const deleteMessages = useCallback(
    async (messageIds: string[]) => {
      await runAction(async () => {
        await deleteContactMessagesBatch(messageIds);
        reload();
      });
    },
    [runAction, reload]
  );

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    updating: actionLoading,
    reload,
    updateMessage,
    deleteMessages,
    lastDoc,
  };
}

export function useNewContactMessagesCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCount(0);
        setLoading(false);
        return;
      }

      const q = query(collection(db, "contact_messages"), where("status", "==", "new"));
      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          setCount(snapshot.size);
          setLoading(false);
        },
        (err) => {
          console.error("Snapshot error:", err);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return { count, loading };
}