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
}

export type UpdateVendorProfileInput = Partial<Omit<VendorProfile, "vendorId" | "createdAt">>;