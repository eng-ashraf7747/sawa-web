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
  referredBy?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
