// C:\sawa-web\hooks\useBookings.ts

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import {
  getUserBookings,
  getVendorBookings,
  createBooking,
  markDelivered,
  markCompleted,
  cancelBooking,
} from "@/lib/bookings";
import { getUser } from "@/lib/users";
import { User } from "@/types";
import {
  Booking,
  CreateBookingInput,
  DeliverBookingInput,
} from "@/types/booking";

// ===== حجوزات المستخدم =====
export function useUserBookings() {
  const { userData } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.uid) {
      setBookings([]);
      return;
    }

    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserBookings(userData.uid);
        if (isActive) setBookings(data);
      } catch {
        if (isActive) setError("تعذر جلب الحجوزات");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();

    return () => { isActive = false; };
  }, [userData?.uid]);

  return { bookings, loading, error };
}

// ===== حجوزات المورد =====
export function useVendorBookings(vendorId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setBookings([]);
      return;
    }

    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVendorBookings(vendorId);
        if (isActive) setBookings(data);
      } catch {
        if (isActive) setError("تعذر جلب الحجوزات");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();

    return () => { isActive = false; };
  }, [vendorId]);

  return { bookings, loading, error };
}

// ===== إجراءات الحجز (محسنة بـ useAsyncAction) =====
export function useBookingActions() {
  const { run, loading, error: actionError } = useAsyncAction();

  const book = async (input: CreateBookingInput): Promise<string | null> => {
    let result: string | null = null;
    await run(async () => {
      result = await createBooking(input);
    });
    return result;
  };

  const deliver = async (
    bookingId: string,
    input: DeliverBookingInput
  ): Promise<boolean> => {
    let success = false;
    await run(async () => {
      await markDelivered(bookingId, input);
      success = true;
    });
    return success;
  };

  const complete = async (bookingId: string): Promise<boolean> => {
    let success = false;
    await run(async () => {
      await markCompleted(bookingId);
      success = true;
    });
    return success;
  };

  const cancel = async (bookingId: string): Promise<boolean> => {
    let success = false;
    await run(async () => {
      await cancelBooking(bookingId);
      success = true;
    });
    return success;
  };

  return { 
    book, 
    deliver, 
    complete, 
    cancel, 
    loading, 
    error: actionError 
  };
}

// ===== بيانات تواصل مشترٍ واحد (لعرضها في كارت حجز المورد) =====
// جلب لمرة واحدة (وليس اشتراكاً حياً) — بيانات ثابتة نسبياً (تليفون/عنوان)
// لا تستدعي مراقبة لحظية لكل كارت حجز في القائمة
export function useBuyerContact(userId: string) {
  const [buyer, setBuyer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let isActive = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getUser(userId);
        if (isActive) setBuyer(data);
      } catch {
        if (isActive) setBuyer(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();

    return () => { isActive = false; };
  }, [userId]);

  return { buyer, loading };
}