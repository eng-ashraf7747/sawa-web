// C:\sawa-web\hooks\useAdminReports.ts

import { useState, useEffect } from "react";
import {
  getPlatformOverview,
  getVendorBreakdown,
  getCategoryBreakdown,
  getBookingsList,
} from "@/lib/adminReports";
import {
  PlatformOverview,
  VendorSummary,
  CategorySummary,
  BookingRow,
  BookingFilters,
} from "@/types/adminReports";

export function usePlatformOverview() {
  const [overview, setOverview] = useState <PlatformOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlatformOverview();
      setOverview(data);
    } catch {
      setError("تعذر جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { overview, loading, error, reload: load };
}

export function useVendorBreakdown() {
  const [vendors, setVendors] = useState <VendorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVendorBreakdown();
      setVendors(data);
    } catch {
      setError("تعذر جلب بيانات الموردين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { vendors, loading, error, reload: load };
}

export function useCategoryBreakdown() {
  const [categories, setCategories] = useState <CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategoryBreakdown();
      setCategories(data);
    } catch {
      setError("تعذر جلب بيانات الفئات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { categories, loading, error, reload: load };
}

export function useBookingsList(filters?: BookingFilters) {
  const [bookings, setBookings] = useState <BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingsList(filters);
      setBookings(data);
    } catch {
      setError("تعذر جلب العمليات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters ? JSON.stringify(filters) : ""]);

  return { bookings, loading, error, reload: load };
}