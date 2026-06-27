// C:\sawa-web\hooks\useRequests.ts

import { useState, useEffect } from "react";
import {
  createOrUpdateRequest,
  deleteRequest,
  getUserRequests,
  getAllRequests,
  getUserActiveRequestsCount,
} from "@/lib/requests";
import {
  Request,
  CreateRequestInput,
  MAX_REQUESTS_PER_USER,
} from "@/types/request";

// ===== طلبات المستخدم =====
export function useUserRequests(userId: string) {
  const [requests, setRequests] = useState <Request[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserRequests(userId);
      setRequests(data);
      setActiveCount(data.filter((r) => r.status === "pending").length);
    } catch {
      setError("تعذر جلب الطلبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  return {
    requests,
    activeCount,
    remaining: MAX_REQUESTS_PER_USER - activeCount,
    loading,
    error,
    reload: load,
  };
}

// ===== إجراءات الطلبات =====
export function useRequestActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState <string | null>(null);

  const submit = async (
    input: CreateRequestInput
  ): Promise <{ id: string; isNew: boolean } | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await createOrUpdateRequest(input);
      return result;
    } catch (err: any) {
      setError(err.message ?? "تعذر تسجيل الطلب");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (
    requestId: string,
    subcategoryId: string
  ): Promise <boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteRequest(requestId, subcategoryId);
      return true;
    } catch {
      setError("تعذر حذف الطلب");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submit, remove, loading, error };
}

// ===== طلبات الأدمن =====
export function useAllRequests() {
  const [requests, setRequests] = useState <Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch {
      setError("تعذر جلب الطلبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { requests, loading, error, reload: load };
}