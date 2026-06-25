// C:\sawa-web\hooks\useBookingReviews.ts

import { useState } from "react";
import {
  createBookingReview,
  getVendorReviews,
  getVendorRatingAverage,
} from "@/lib/bookings";
import {
  BookingReview,
  CreateBookingReviewInput,
} from "@/types/booking";

export function useBookingReviewActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState <string | null>(null);

  const submitReview = async (
    input: CreateBookingReviewInput
  ): Promise <boolean> => {
    setLoading(true);
    setError(null);
    try {
      await createBookingReview(input);
      return true;
    } catch {
      setError("تعذر إرسال التقييم");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submitReview, loading, error };
}

export function useVendorRating(vendorId: string) {
  const [reviews, setReviews] = useState <BookingReview[]>([]);
  const [average, setAverage] = useState <number | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState <string | null>(null);

  const load = async () => {
    if (!vendorId) return;
    setLoading(true);
    try {
      const [r, avg] = await Promise.all([
        getVendorReviews(vendorId),
        getVendorRatingAverage(vendorId),
      ]);
      setReviews(r);
      setAverage(avg?.average ?? null);
      setCount(avg?.count ?? 0);
    } catch {
      setError("تعذر جلب التقييمات");
    } finally {
      setLoading(false);
    }
  };

  return { reviews, average, count, loading, error, load };
}