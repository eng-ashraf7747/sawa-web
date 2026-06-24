// C:\sawa-web\types\deal.ts

export type DealStatus = "draft" | "pending" | "active" | "inactive" | "rejected";

export interface Deal {
  id: string;
  categoryId: string;
  vendorId?: string | null;
  vendorName?: string | null;
  title: string;
  description: string;
  imageUrl?: string | null;
  discount: string;
  externalUrl?: string | null;
  expiresAt?: Date | null;
  status: DealStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDealInput = Omit<Deal, "id" | "createdAt" | "updatedAt">;
export type UpdateDealInput = Partial<Omit<Deal, "id" | "createdAt">>;

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  draft: "مسودة",
  pending: "في انتظار الموافقة",
  active: "نشط",
  inactive: "معطل",
  rejected: "مرفوض",
};