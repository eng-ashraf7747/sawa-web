// C:\sawa-web\types\request.ts

export type RequestStatus = "pending" | "fulfilled" | "cancelled";

export interface Request {
  id: string;
  userId: string;
  userName: string;
  city: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  title: string;
  description: string;
  status: RequestStatus;
  interestedCount: number;
  createdAt: Date;
  updatedAt: Date;
  fulfilledAt: Date | null;
}

export interface CreateRequestInput {
  userId: string;
  userName: string;
  city: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  title: string;
  description: string;
}

export interface UpdateRequestInput {
  title?: string;
  description?: string;
  updatedAt?: Date;
}

export const REQUEST_STATUS_LABELS: Record <RequestStatus, string> = {
  pending: "قيد الانتظار",
  fulfilled: "تم التنفيذ",
  cancelled: "ملغي",
};

export const MAX_REQUESTS_PER_USER = 5;