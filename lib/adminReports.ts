// C:\sawa-web\lib\adminReports.ts

import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import {
  PlatformOverview,
  VendorSummary,
  CategorySummary,
  BookingRow,
  BookingFilters,
} from "@/types/adminReports";

// ===== نظرة عامة على المنصة =====
export async function getPlatformOverview(): Promise <PlatformOverview> {
  try {
    const snap = await getDocs(collection(db, "bookings"));
    const docs = snap.docs.map((d) => d.data());

    const totalBookings = docs.length;
    const completedBookings = docs.filter((d) => d.status === "completed").length;
    const pendingBookings = docs.filter((d) => d.status === "pending" || d.status === "delivered").length;
    const cancelledBookings = docs.filter((d) => d.status === "cancelled").length;
    const totalRevenue = docs
      .filter((d) => d.status === "completed" && d.orderValue)
      .reduce((sum, d) => sum + (d.orderValue ?? 0), 0);

    const reviewsSnap = await getDocs(
      query(
        collection(db, "bookingReviews"),
        where("type", "==", "user_to_vendor")
      )
    );
    const ratings = reviewsSnap.docs.map((d) => d.data().rating ?? 0);
    const avgRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    const usersSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "user"))
    );
    const vendorsSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "vendor"))
    );

    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      avgRating,
      totalVendors: vendorsSnap.size,
      totalUsers: usersSnap.size,
    };
  } catch (error) {
    console.error("getPlatformOverview error:", error);
    throw new Error("تعذر جلب نظرة عامة على المنصة");
  }
}

// ===== تفصيل حسب المورد =====
export async function getVendorBreakdown(): Promise <VendorSummary[]> {
  try {
    const snap = await getDocs(collection(db, "bookings"));
    const docs = snap.docs.map((d) => d.data());

    const vendorMap = new Map <string, VendorSummary>();

    for (const d of docs) {
      if (!d.vendorId) continue;
      const existing = vendorMap.get(d.vendorId);
      if (existing) {
        existing.totalBookings++;
        if (d.status === "completed") {
          existing.completedBookings++;
          existing.totalRevenue += d.orderValue ?? 0;
        }
      } else {
        vendorMap.set(d.vendorId, {
          vendorId: d.vendorId,
          vendorName: d.vendorName ?? "",
          totalBookings: 1,
          completedBookings: d.status === "completed" ? 1 : 0,
          totalRevenue: d.status === "completed" ? (d.orderValue ?? 0) : 0,
          avgRating: null,
        });
      }
    }

    const reviewsSnap = await getDocs(
      query(
        collection(db, "bookingReviews"),
        where("type", "==", "user_to_vendor")
      )
    );

    const ratingMap = new Map <string, number[]>();
    for (const r of reviewsSnap.docs) {
      const data = r.data();
      if (!ratingMap.has(data.targetId)) ratingMap.set(data.targetId, []);
      ratingMap.get(data.targetId)!.push(data.rating ?? 0);
    }

    for (const [vendorId, vendor] of vendorMap) {
      const ratings = ratingMap.get(vendorId);
      if (ratings && ratings.length >= 5) {
        vendor.avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
    }

    return Array.from(vendorMap.values())
      .sort((a, b) => b.totalBookings - a.totalBookings);
  } catch (error) {
    console.error("getVendorBreakdown error:", error);
    throw new Error("تعذر جلب تفصيل الموردين");
  }
}

// ===== تفصيل حسب الفئة =====
export async function getCategoryBreakdown(): Promise <CategorySummary[]> {
  try {
    const snap = await getDocs(collection(db, "bookings"));
    const docs = snap.docs.map((d) => d.data());

    const categoryMap = new Map <string, CategorySummary>();

    for (const d of docs) {
      if (!d.dealCategory) continue;
      const existing = categoryMap.get(d.dealCategory);
      if (existing) {
        existing.totalBookings++;
        if (d.status === "completed") {
          existing.completedBookings++;
          existing.totalRevenue += d.orderValue ?? 0;
        }
      } else {
        categoryMap.set(d.dealCategory, {
          categoryId: d.dealCategory,
          categoryName: d.dealCategory,
          totalBookings: 1,
          completedBookings: d.status === "completed" ? 1 : 0,
          totalRevenue: d.status === "completed" ? (d.orderValue ?? 0) : 0,
        });
      }
    }

    return Array.from(categoryMap.values())
      .sort((a, b) => b.totalBookings - a.totalBookings);
  } catch (error) {
    console.error("getCategoryBreakdown error:", error);
    throw new Error("تعذر جلب تفصيل الفئات");
  }
}

// ===== قائمة العمليات مع فلاتر =====
export async function getBookingsList(
  filters?: BookingFilters
): Promise <BookingRow[]> {
  try {
    let q = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    if (filters?.status) {
      q = query(
        collection(db, "bookings"),
        where("status", "==", filters.status),
        orderBy("createdAt", "desc"),
        limit(100)
      );
    }

    if (filters?.vendorId) {
      q = query(
        collection(db, "bookings"),
        where("vendorId", "==", filters.vendorId),
        orderBy("createdAt", "desc"),
        limit(100)
      );
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        dealTitle: data.dealTitle ?? "",
        dealCategory: data.dealCategory ?? "",
        userName: data.userName ?? "",
        vendorName: data.vendorName ?? "",
        orderValue: data.orderValue ?? null,
        status: data.status ?? "",
        contactChannel: data.contactChannel ?? "",
        isReferral: data.isReferral ?? false,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        completedAt: data.completedAt
          ? (data.completedAt as Timestamp).toDate()
          : null,
      };
    });
  } catch (error) {
    console.error("getBookingsList error:", error);
    throw new Error("تعذر جلب قائمة العمليات");
  }
}