// C:\sawa-web\types\deal.ts

export type DealStatus = "draft" | "pending" | "active" | "inactive" | "rejected";

export interface Deal {
  id: string;
  categoryId: string;
  vendorId?: string | null;
  vendorName?: string | null;
  title: string;
  description: string;
  imageUrl?: string | null;
  discount: string;
  externalUrl?: string | null;
  expiresAt?: Date | null;
  status: DealStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDealInput = Omit<Deal, "id" | "createdAt" | "updatedAt">;
export type UpdateDealInput = Partial<Omit<Deal, "id" | "createdAt">>;

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  draft: "مسودة",
  pending: "في انتظار الموافقة",
  active: "نشط",
  inactive: "معطل",
  rejected: "مرفوض",
};

// ==========================================
// نص صلاحية العرض (اختياري بالكامل) — يُستخدم في شاشات
// المستخدم والمورد والأدمن الثلاث بنفس الأسلوب (Symmetry)
// ==========================================

/**
 * صياغة عدد الأيام بالعربية بقواعد الجمع الصحيحة (يوم/يومين/أيام/يوماً)
 */
function formatDaysArabic(days: number): string {
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومين";
  if (days >= 3 && days <= 10) return `${days} أيام`;
  return `${days} يوماً`;
}

/**
 * نص "العرض ساري لمدة كذا يوم أو حتى نفاذ الكمية" لعرضه على أي شاشة
 * تعرض تفاصيل الصفقة (مستخدم / مورد / أدمن)
 *
 * دالة نقية بالكامل (بدون Firestore) — تُستدعى من الثلاث شاشات بنفس
 * الطريقة، بدلاً من إعادة كتابة منطق حساب الأيام المتبقية في كل مكوّن
 *
 * @param expiresAt تاريخ انتهاء الصلاحية — اختياري تماماً، والمورد/الأدمن
 * غير مُلزمين بتحديده أصلاً
 * @returns النص الجاهز للعرض، أو null إذا لم يُحدَّد تاريخ انتهاء
 * (لا نعرض شيئاً في هذه الحالة، وليس رسالة فارغة)
 */
export function formatDealExpiryLabel(expiresAt?: Date | null): string | null {
  if (!expiresAt) return null;

  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  if (diffMs <= 0) return null; // انتهت الصلاحية فعلياً — المهمة المجدولة تتكفل بتعطيلها

  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return `العرض ساري لمدة ${formatDaysArabic(diffDays)} أو حتى نفاذ الكمية`;
}