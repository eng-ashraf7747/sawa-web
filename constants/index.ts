// C:\sawa-web\constants\index.ts
import { City, Service, NavLink } from "@/types";

export const CITIES: City[] = [
  { id: "fayoum", name: "Fayoum", nameAr: "الفيوم", available: true },
  { id: "cairo", name: "Cairo", nameAr: "القاهرة", available: false },
  { id: "alex", name: "Alexandria", nameAr: "الإسكندرية", available: false },
  { id: "minya", name: "Minya", nameAr: "المنيا", available: false },
  { id: "assiut", name: "Assiut", nameAr: "أسيوط", available: false },
];

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

export const TIERS = {
  bronze: { min: 100, max: 299, nameAr: "برونزية" },
  silver: { min: 300, max: 599, nameAr: "فضية" },
  gold: { min: 600, max: 999, nameAr: "ذهبية" },
  diamond: { min: 1000, max: Infinity, nameAr: "ماسية" },
};

export const NAV_LINKS: NavLink[] = [
  { labelAr: "كيف تعمل؟", href: "/how-it-works", badgeAr: "قريباً" },
  { labelAr: "العضوية", href: "/membership" },
  { labelAr: "لأصحاب الأعمال", href: "/for-business" },
  { labelAr: "تواصل معنا", href: "/contact" },
];