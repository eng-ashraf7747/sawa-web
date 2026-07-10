// C:\sawa-web\types\index.ts

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  photoURL?: string;
  city: string;
  address?: string;
  gender?: "male" | "female";
  age?: number;
  role: "user" | "vendor" | "admin";
  tier: "regular" | "bronze" | "silver" | "gold" | "diamond";
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
  id: string;
  userId: string;
  type:
    | "signup_bonus"
    | "referral_joiner_bonus"
    | "referral_owner_bonus"
    | "admin_adjustment"
    | "subscription_payment";
  points: number;
  monetaryValue: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  expiryDate: Date | null;
  note: string;
  createdAt: Date;
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

export interface NavLink {
  labelAr: string;
  href: string;
  badgeAr?: string;
}

export interface TierConfig {
  nameAr: string;
  min: number;
  max: number;
  color: string;
  bg: string;
  icon: string;
}

export type AuthMode = "login" | "register" | "forgotPassword";

export type { Deal, CreateDealInput, UpdateDealInput } from "./deal";
export type { Category, CreateCategoryInput, UpdateCategoryInput } from "./category";
export type { Transaction, CreateTransactionInput, TransactionStatus } from "./transaction";
export type { Review, CreateReviewInput } from "./review";
export type { VendorStats, DealStat } from "./vendor";
export type {
  Booking,
  CreateBookingInput,
  DeliverBookingInput,
  BookingReview,
  CreateBookingReviewInput,
  ReviewType,
  ContactChannel,
  BookingStatus,
} from "./booking";
export {
  BOOKING_STATUS_LABELS,
  CONTACT_CHANNEL_LABELS,
  REVIEW_TYPE_LABELS,
  COMMISSION_RATE,
  POINTS_PER_EGP,
  MAX_COMMISSION_PER_BOOKING,
  MIN_OPERATIONS_FOR_RATING,
  BOOKING_CANCEL_HOURS,
} from "./booking";
export type {
  ContactMessage,
  CreateContactMessageInput,
  ContactMessageMethod,
  ContactMessageCategory,
  ContactMessageStatus,
  ContactMessageSenderType,
  ContactMessageFilters,
} from "./contact";
export {
  CONTACT_MESSAGE_CATEGORY_LABELS,
  CONTACT_MESSAGE_METHOD_LABELS,
  CONTACT_MESSAGE_STATUS_LABELS,
  CONTACT_MESSAGE_SENDER_TYPE_LABELS,
} from "./contact";