// C:\sawa-web\types\vendorProfile.ts

export interface VendorProfile {
  vendorId: string;
  businessName: string;
  description?: string | null;
  address?: string | null;
  mapsUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // عدّاد استخدام تقرير "تقييم المشترين" الشهري (حماية من التكلفة، وليست
  // حماية أمان حقيقية — راجع الملاحظة في lib/bookings.ts لسبب هذا القرار)
  buyerReportRequestCount?: number;
  buyerReportRequestMonth?: string;
}

export type UpdateVendorProfileInput = Partial<Omit<VendorProfile, "vendorId" | "createdAt">>;