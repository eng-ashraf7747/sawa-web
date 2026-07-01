// C:\sawa-web\hooks\useAsyncAction.ts
"use client";

import { useState, useCallback, useRef } from "react";

interface UseAsyncActionReturn {
  run: (fn: () => Promise <void>) => Promise <void>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useAsyncAction(): UseAsyncActionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState <string | null>(null);
  const loadingRef = useRef(false);

  const run = useCallback(async (fn: () => Promise <void>) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      await fn();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { run, loading, error, clearError };
}