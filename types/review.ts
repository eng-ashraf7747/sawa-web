// C:\sawa-web\types\review.ts

export interface Review {
  id: string;
  vendorId: string;
  dealId: string;
  dealTitle: string;
  rating: number;
  comment: string;
  timestamp: Date;
}

export type CreateReviewInput = Omit<Review, "id">;