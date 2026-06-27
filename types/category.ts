// C:\sawa-web\types\category.ts

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface CreateCategoryInput extends Omit <Category, "id" | "createdAt" | "updatedAt"> {}
export interface UpdateCategoryInput extends Partial <Omit <Category, "id" | "createdAt">> {}
export interface CreateSubcategoryInput extends Omit <Subcategory, "id" | "createdAt" | "updatedAt"> {}
export interface UpdateSubcategoryInput extends Partial <Omit <Subcategory, "id" | "createdAt" | "categoryId">> {}