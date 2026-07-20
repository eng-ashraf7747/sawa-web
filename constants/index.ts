// C:\sawa-web\constants\index.ts

import { City, Service, NavLink, TierConfig } from "@/types";


export const SERVICES: Service[] = [
  { id: "books", nameAr: "كتب مدرسية", icon: "📚", available: false },
  { id: "supermarket", nameAr: "سوبر ماركت", icon: "🛒", available: false },
  { id: "restaurants", nameAr: "مطاعم", icon: "🍽️", available: false },
  { id: "medical", nameAr: "خدمات طبية", icon: "🏥", available: false },
  { id: "maintenance", nameAr: "صيانة منزلية", icon: "🔧", available: false },
  { id: "travel", nameAr: "سفر وترفيه", icon: "✈️", available: false },
  { id: "tech", nameAr: "تكنولوجيا", icon: "📱", available: false },
  { id: "education", nameAr: "تعليم", icon: "🏫", available: false },
];

export const TIERS: Record<"regular" | "bronze" | "silver" | "gold" | "diamond", TierConfig> = {
  regular: { nameAr: "عضو", min: 0, max: 99, color: "#6b7280", bg: "#f8f9fb", icon: "⭐" },
  bronze: { nameAr: "برونزي", min: 100, max: 299, color: "#cd7f32", bg: "#fdf3e7", icon: "🥉" },
  silver: { nameAr: "فضي", min: 300, max: 599, color: "#c0c0c0", bg: "#f5f5f5", icon: "🥈" },
  gold: { nameAr: "ذهبي", min: 600, max: 999, color: "#c9a84c", bg: "#fefce8", icon: "🥇" },
  diamond: { nameAr: "ماسي", min: 1000, max: Infinity, color: "#E8F4FD", bg: "#eff6ff", icon: "💎" },
};

export const NAV_LINKS: NavLink[] = [
  { labelAr: "كيف تعمل؟", href: "/how-it-works", badgeAr: "قريباً" },
  { labelAr: "العضوية", href: "/membership" },
  { labelAr: "لأصحاب الأعمال", href: "/for-business" },
  { labelAr: "تواصل معنا", href: "/contact" },
];