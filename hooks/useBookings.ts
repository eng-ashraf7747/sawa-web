// C:\sawa-web\hooks\useBookings.ts

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import {
  getUserBookings,
  getVendorBookings,
  createBooking,
  markDelivered,
  markCompleted,
  cancelBooking,
} from "@/lib/bookings";
import {
  Booking,
  CreateBookingInput,
  DeliverBookingInput,
} from "@/types/booking";

// ===== حجوزات المستخدم =====
export function useUserBookings() {
  const { userData } = useUser();
  const [bookings, setBookings] = useState <Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  useEffect(() => {
    if (!userData?.uid) return;
    setLoading(true);
    getUserBookings(userData.uid)
      .then(setBookings)
      .catch(() => setError("تعذر جلب الحجوزات"))
      .finally(() => setLoading(false));
  }, [userData?.uid]);

  return { bookings, loading, error };
}

// ===== حجوزات المورد =====
export function useVendorBookings(vendorId: string) {
  const [bookings, setBookings] = useState <Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    getVendorBookings(vendorId)
      .then(setBookings)
      .catch(() => setError("تعذر جلب الحجوزات"))
      .finally(() => setLoading(false));
  }, [vendorId]);

  return { bookings, loading, error };
}

// ===== إجراءات الحجز =====
export function useBookingActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState <string | null>(null);

  const book = async (input: CreateBookingInput): Promise <string | null> => {
    setLoading(true);
    setError(null);
    try {
      const id = await createBooking(input);
      return id;
    } catch {
      setError("تعذر إنشاء الحجز");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deliver = async (
    bookingId: string,
    input: DeliverBookingInput
  ): Promise <boolean> => {
    setLoading(true);
    setError(null);
    try {
      await markDelivered(bookingId, input);
      return true;
    } catch {
      setError("تعذر تسجيل التسليم");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const complete = async (bookingId: string): Promise <boolean> => {
    setLoading(true);
    setError(null);
    try {
      await markCompleted(bookingId);
      return true;
    } catch {
      setError("تعذر تأكيد الاستلام");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (bookingId: string): Promise <boolean> => {
    setLoading(true);
    setError(null);
    try {
      await cancelBooking(bookingId);
      return true;
    } catch {
      setError("تعذر إلغاء الحجز");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { book, deliver, complete, cancel, loading, error };
}