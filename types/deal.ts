// C:\sawa-web\types\deal.ts

export interface Deal {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  imageUrl?: string;
  discount: string;
  externalUrl?: string;
  expiresAt?: Date | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDealInput = Omit<Deal, "id" | "createdAt" | "updatedAt">;
export type UpdateDealInput = Partial<Omit<Deal, "id" | "createdAt">>;