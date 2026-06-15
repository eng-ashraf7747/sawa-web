export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  city: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  points: number;
  referralCode: string;
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

export type AuthMode = "login" | "register";