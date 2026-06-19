// lib/mockData.ts

// ─── Types ────────────────────────────────────────────────────
export interface Deal {
  id: string;
  title: string;
  discount: string;
  icon: string;
  members: number;
  maxMembers: number;
}

export interface Request {
  id: string;
  title: string;
  icon: string;
  current: number;
  target: number;
}

// ─── Mock Deals ───────────────────────────────────────────────
export const mockDeals: Deal[] = [
  {
    id: "1",
    title: "حسومات السوبر ماركت",
    discount: "35%",
    icon: "🛒",
    members: 87,
    maxMembers: 100,
  },
  {
    id: "2",
    title: "عروض الإلكترونيات",
    discount: "20%",
    icon: "📱",
    members: 64,
    maxMembers: 100,
  },
  {
    id: "3",
    title: "كتب مدرسية",
    discount: "25%",
    icon: "📚",
    members: 45,
    maxMembers: 100,
  },
  {
    id: "4",
    title: "خدمات طبية",
    discount: "15%",
    icon: "🏥",
    members: 32,
    maxMembers: 100,
  },
];

// ─── Mock Requests ────────────────────────────────────────────
export const mockRequests: Request[] = [
  {
    id: "1",
    title: "كتب مدرسية",
    icon: "📚",
    current: 45,
    target: 100,
  },
  {
    id: "2",
    title: "سوبر ماركت",
    icon: "🛒",
    current: 23,
    target: 100,
  },
  {
    id: "3",
    title: "دروس خصوصية",
    icon: "🏫",
    current: 67,
    target: 100,
  },
];