// C:\sawa-web\types\index.ts

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  city: string;
  role: "user" | "vendor" | "admin";
  tier: "bronze" | "silver" | "gold" | "diamond";
  points: number;
  referralCode: string;
  referralStatus: "active" | "expired" | "pending" | "rejected";
  referralActivatedAt?: Date;
  referralUsageCount: number;
  referralRequestCount: number;
  referralRequestMonth: string;
  referredBy?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointsLedgerEntry {
  type: "signup_bonus" | "referral_joiner_bonus" | "referral_owner_bonus" | "admin_adjustment" | "subscription_payment";
  points: number;
  timestamp: Date;
  note: string;
}

export interface City {
  id: string;
  name: string;
  nameAr: string;
  available: boolean;
}

export interface Service {
  id: string;
  nameAr: string;
  icon: string;
  available: boolean;
}

export type AuthMode = "login" | "register" | "forgotPassword";

export type { Deal, CreateDealInput, UpdateDealInput } from "./deal";
export type { Category, CreateCategoryInput, UpdateCategoryInput } from "./category";
export type { Transaction, CreateTransactionInput, TransactionStatus } from "./transaction";
export type { Review, CreateReviewInput } from "./review";
export type { VendorStats, DealStat } from "./vendor";