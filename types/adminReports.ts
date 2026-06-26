// C:\sawa-web\types\adminReports.ts

// ===== نظرة عامة على المنصة =====
export interface PlatformOverview {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  avgRating: number;
  totalVendors: number;
  totalUsers: number;
}

// ===== ملخص مورد =====
export interface VendorSummary {
  vendorId: string;
  vendorName: string;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  avgRating: number | null;
}

// ===== ملخص فئة =====
export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
}

// ===== صف في قائمة العمليات =====
export interface BookingRow {
  id: string;
  dealTitle: string;
  dealCategory: string;
  userName: string;
  vendorName: string;
  orderValue: number | null;
  status: string;
  contactChannel: string;
  isReferral: boolean;
  createdAt: Date;
  completedAt: Date | null;
}

// ===== فلاتر قائمة العمليات =====
export interface BookingFilters {
  status?: string;
  vendorId?: string;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ===== المستوى النشط في التقارير =====
export type ReportLevel =
  | "overview"
  | "breakdown"
  | "list"
  | "detail";

export type BreakdownType =
  | "vendor"
  | "category";