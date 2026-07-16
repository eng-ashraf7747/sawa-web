// C:\sawa-web\lib\exportExcel.ts

import * as XLSX from "xlsx";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "@/lib/firebase";
import { ANALYTICS_COLLECTIONS } from "@/types/analytics";

function fmtDate(d: any): string {
  if (!d) return "—";
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toISOString().split("T")[0];
}

function fmtTime(d: any): string {
  if (!d) return "—";
  const date = d?.toDate ? d.toDate() : new Date(d);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function fmtNum(n: number | null | undefined): number {
  return n ?? 0;
}

function str(v: any): string {
  return v ?? "—";
}

async function getCategoryMap(): Promise<Record<string, string>> {
  const snap = await getDocs(collection(db, "categories"));
  const map: Record<string, string> = {};
  snap.docs.forEach((d) => { map[d.id] = d.data().name ?? d.id; });
  return map;
}

// ─── Sheet 1: Summary ─────────────────────────────────────────
async function buildSummarySheet(
  startDate: Date,
  endDate: Date
): Promise<any[][]> {
  const start = Timestamp.fromDate(startDate);
  const end = Timestamp.fromDate(endDate);

  const bookingsSnap = await getDocs(
    query(
      collection(db, "bookings"),
      where("createdAt", ">=", start),
      where("createdAt", "<=", end)
    )
  );
  const bookings = bookingsSnap.docs.map((d) => d.data());

  const completed = bookings.filter((b) => b.status === "completed");
  const totalInvoice = completed.reduce((s, b) => s + (b.orderValue ?? 0), 0);

  const usersSnap = await getDocs(collection(db, "users"));
  const totalUsers = usersSnap.docs.filter((d) => d.data().role === "user").length;
  const totalVendors = usersSnap.docs.filter((d) => d.data().role === "vendor").length;

  // ملاحظة معمارية (16 يوليو 2026): نفس استعلام النقاط الشامل الذي كان
  // موجوداً في hooks/useExecutiveDashboard.ts (ومكسوراً بنفس السبب) كان
  // مكرراً هنا حرفياً. انتقل الحساب بالكامل لنفس الدالة على السيرفر
  // (Cloud Function: getPointsTotals) بدل تكرار المنطق المكسور مرتين.
  const functions = getFunctions(undefined, "us-central1");
  const getPointsTotals = httpsCallable<
    { startMs: number; endMs: number },
    { totalGranted: number; totalRedeemed: number }
  >(functions, "getPointsTotals");

  const pointsResult = await getPointsTotals({
    startMs: startDate.getTime(),
    endMs: endDate.getTime(),
  });

  const totalPointsGranted = pointsResult.data.totalGranted;
  const totalPointsRedeemed = pointsResult.data.totalRedeemed;

  const conversionRate = bookings.length > 0
    ? Math.round((completed.length / bookings.length) * 100)
    : 0;

  return [
    ["تقرير سوا — ملخص تنفيذي"],
    [`الفترة: ${fmtDate(startDate)} — ${fmtDate(endDate)}`],
    [`تاريخ التصدير: ${fmtDate(new Date())}`],
    [],
    ["المؤشر", "القيمة"],
    ["إجمالي المستخدمين", totalUsers],
    ["إجمالي الموردين", totalVendors],
    ["إجمالي الحجوزات", bookings.length],
    ["عمليات مكتملة", completed.length],
    ["عمليات ملغاة", bookings.filter((b) => b.status === "cancelled").length],
    ["معدل التحويل %", conversionRate],
    ["إجمالي قيمة الفواتير (جنيه)", totalInvoice],
    ["متوسط قيمة الفاتورة (جنيه)", completed.length > 0 ? Math.round(totalInvoice / completed.length) : 0],
    ["نقاط ممنوحة", totalPointsGranted],
    ["نقاط مستخدمة", totalPointsRedeemed],
    ["تكلفة النقاط (جنيه)", totalPointsRedeemed * 0.5],
  ];
}

// ─── Sheet 2: Bookings ─────────────────────────────────────────
async function buildBookingsSheet(
  startDate: Date,
  endDate: Date,
  categoryMap: Record<string, string>
): Promise<any[][]> {
  const snap = await getDocs(
    query(
      collection(db, "bookings"),
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate)),
      orderBy("createdAt", "desc")
    )
  );

  const headers = [
    "bookingId", "userId", "vendorId", "اسم المستخدم", "اسم المورد",
    "العرض", "الفئة", "قناة التواصل", "قيمة الفاتورة",
    "العمولة", "الحالة", "أول حجز؟", "إحالة؟",
    "تاريخ الحجز", "ساعة الحجز", "تاريخ التسليم", "تاريخ الإتمام",
    "سبب الإلغاء"
  ];

  const rows = snap.docs.map((d) => {
    const b = d.data();
    return [
      d.id,
      str(b.userId),
      str(b.vendorId),
      str(b.userName),
      str(b.vendorName),
      str(b.dealTitle),
      categoryMap[b.dealCategory] ?? str(b.dealCategory),
      str(b.contactChannel),
      fmtNum(b.orderValue),
      fmtNum(b.commission),
      str(b.status),
      b.isFirstBooking ? "نعم" : "لا",
      b.isReferral ? "نعم" : "لا",
      fmtDate(b.createdAt),
      fmtTime(b.createdAt),
      fmtDate(b.deliveredAt),
      fmtDate(b.completedAt),
      str(b.cancellationReason),
    ];
  });

  return [headers, ...rows];
}

// ─── Sheet 3: Users ─────────────────────────────────────────
async function buildUsersSheet(
  startDate: Date,
  endDate: Date
): Promise<any[][]> {
  const usersSnap = await getDocs(collection(db, "users"));
  const bookingsSnap = await getDocs(collection(db, "bookings"));

  const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const headers = [
    "userId", "الاسم", "البريد الإلكتروني", "الهاتف",
    "المدينة", "الدور", "مستوى العضوية", "النقاط",
    "مصدر التسجيل", "كود الإحالة", "محال من",
    "إجمالي الحجوزات", "عمليات مكتملة", "إجمالي الإنفاق",
    "تاريخ التسجيل", "نشط؟"
  ];

  const rows = usersSnap.docs
    .filter((d) => d.data().role === "user")
    .map((d) => {
      const u = d.data();
      const userBookings = bookings.filter((b: any) => b.userId === d.id);
      const completedBookings = userBookings.filter((b: any) => b.status === "completed");
      const totalSpent = completedBookings.reduce((s: number, b: any) => s + (b.orderValue ?? 0), 0);

      return [
        d.id,
        str(u.displayName),
        str(u.email),
        str(u.phone),
        str(u.city),
        str(u.role),
        str(u.tier),
        fmtNum(u.points),
        str(u.registrationSource),
        str(u.referralCode),
        str(u.referredBy),
        userBookings.length,
        completedBookings.length,
        totalSpent,
        fmtDate(u.createdAt),
        u.isActive ? "نعم" : "لا",
      ];
    });

  return [headers, ...rows];
}

// ─── Sheet 4: Vendors ─────────────────────────────────────────
async function buildVendorsSheet(): Promise<any[][]> {
  const usersSnap = await getDocs(
    query(collection(db, "users"), where("role", "==", "vendor"))
  );
  const bookingsSnap = await getDocs(collection(db, "bookings"));
  const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const headers = [
    "vendorId", "الاسم", "البريد الإلكتروني",
    "إجمالي الحجوزات", "عمليات مكتملة", "عمليات ملغاة",
    "إجمالي المبيعات", "إجمالي العمولات لسوا",
    "تاريخ التسجيل", "نشط؟"
  ];

  const rows = usersSnap.docs.map((d) => {
    const v = d.data();
    const vendorBookings = bookings.filter((b: any) => b.vendorId === d.id);
    const completed = vendorBookings.filter((b: any) => b.status === "completed");
    const cancelled = vendorBookings.filter((b: any) => b.status === "cancelled");
    const totalSales = completed.reduce((s: number, b: any) => s + (b.orderValue ?? 0), 0);
    const totalCommission = completed.reduce((s: number, b: any) => s + (b.commission ?? 0), 0);

    return [
      d.id,
      str(v.displayName),
      str(v.email),
      vendorBookings.length,
      completed.length,
      cancelled.length,
      totalSales,
      totalCommission,
      fmtDate(v.createdAt),
      v.isActive ? "نعم" : "لا",
    ];
  });

  return [headers, ...rows];
}

// ─── Sheet 5: Analytics Events ─────────────────────────────────────────────
async function buildAnalyticsSheet(
  startDate: Date,
  endDate: Date,
  categoryMap: Record<string, string>
): Promise<any[][]> {
  const snap = await getDocs(
    query(
      collection(db, ANALYTICS_COLLECTIONS.EVENTS),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      where("timestamp", "<=", Timestamp.fromDate(endDate)),
      orderBy("timestamp", "desc")
    )
  );

  const headers = [
    "eventId", "نوع الحدث", "userId", "vendorId",
    "offerId", "categoryId", "اسم الفئة", "bookingId", "requestId",
    "المصدر", "الجهاز", "sessionId", "القيمة",
    "تغيير النقاط", "التاريخ", "الساعة"
  ];

  const rows = snap.docs.map((d) => {
    const e = d.data();
    return [
      d.id,
      str(e.eventType),
      str(e.userId),
      str(e.vendorId),
      str(e.offerId),
      str(e.categoryId),
      e.categoryId ? (categoryMap[e.categoryId] ?? str(e.categoryId)) : "—",
      str(e.bookingId),
      str(e.requestId),
      str(e.source),
      str(e.device),
      str(e.sessionId),
      fmtNum(e.value),
      fmtNum(e.pointsChange),
      fmtDate(e.timestamp),
      fmtTime(e.timestamp),
    ];
  });

  return [headers, ...rows];
}

// ─── Sheet 6: Commissions ─────────────────────────────────────────────
async function buildCommissionsSheet(
  startDate: Date,
  endDate: Date
): Promise<any[][]> {
  const snap = await getDocs(
    query(
      collection(db, "commission_ledger"),
      where("createdAt", ">=", Timestamp.fromDate(startDate)),
      where("createdAt", "<=", Timestamp.fromDate(endDate)),
      orderBy("createdAt", "desc")
    )
  );

  const headers = [
    "commissionId", "bookingId", "userId", "vendorId",
    "قيمة الفاتورة", "نسبة العمولة", "العمولة المستحقة",
    "الحد الأقصى", "الحالة", "التاريخ"
  ];

  const rows = snap.docs.map((d) => {
    const c = d.data();
    return [
      d.id,
      str(c.bookingId),
      str(c.userId),
      str(c.vendorId),
      fmtNum(c.invoiceValue),
      `${(c.commissionRate ?? 0) * 100}%`,
      fmtNum(c.commissionDue),
      fmtNum(c.commissionCap),
      str(c.status),
      fmtDate(c.createdAt),
    ];
  });

  return [headers, ...rows];
}

// ─── الدالة الرئيسية للتصدير ─────────────────────────────────────
export async function exportToExcel(
  startDate: Date,
  endDate: Date
): Promise<void> {
  const categoryMap = await getCategoryMap();

  const [
    summaryData,
    bookingsData,
    usersData,
    vendorsData,
    analyticsData,
    commissionsData,
  ] = await Promise.all([
    buildSummarySheet(startDate, endDate),
    buildBookingsSheet(startDate, endDate, categoryMap),
    buildUsersSheet(startDate, endDate),
    buildVendorsSheet(),
    buildAnalyticsSheet(startDate, endDate, categoryMap),
    buildCommissionsSheet(startDate, endDate),
  ]);

  const wb = XLSX.utils.book_new();

  const sheets = [
    { name: "summary", data: summaryData },
    { name: "bookings", data: bookingsData },
    { name: "users", data: usersData },
    { name: "vendors", data: vendorsData },
    { name: "analytics_events", data: analyticsData },
    { name: "commissions", data: commissionsData },
  ];

  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  const fileName = `sawa_report_${fmtDate(startDate)}_${fmtDate(endDate)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
