// C:\sawa-web\types\deal.ts

export type DealCategory =
  | "food"
  | "services"
  | "electronics"
  | "clothing"
  | "health"
  | "education"
  | "other";

export type DealStatus = "active" | "inactive" | "expired";

export interface Deal {
  id: string;
  title: string;
  description: string;
  category: DealCategory;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  imageUrl?: string;
  status: DealStatus;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  interestedCount: number;
}

export type CreateDealInput = Omit< 
  Deal,
  "id" | "createdAt" | "updatedAt" | "interestedCount" | "discountPercent"
>;

export const DEAL_CATEGORY_LABELS: Record<DealCategory, string> = {
  food: "مواد غذائية",
  services: "خدمات",
  electronics: "إلكترونيات",
  clothing: "ملابس",
  health: "صحة وجمال",
  education: "تعليم",
  other: "أخرى",
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  active: "نشط",
  inactive: "معطل",
  expired: "منتهي",
};