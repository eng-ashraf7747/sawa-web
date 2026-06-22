// C:\sawa-web\types\category.ts

export interface Category {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateCategoryInput = Omit<Category, "id" | "createdAt" | "updatedAt">;
export type UpdateCategoryInput = Partial<Omit<Category, "id" | "createdAt">>;