// C:\sawa-web\lib\profileValidation.ts
import { isValidEgyptianPhone } from "@/lib/validations";

export interface UpdateUserProfileInput {
  displayName: string;
  phone: string;
  city: string;
  address?: string;
  gender?: "male" | "female";
  age?: number;
}

const MIN_AGE = 12;
const MAX_AGE = 100;
const MAX_NAME_LENGTH = 50;
const MAX_CITY_LENGTH = 50;
const MAX_ADDRESS_LENGTH = 200;

export const MAX_SOURCE_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
export const MAX_UPLOAD_IMAGE_SIZE_BYTES = 300 * 1024; // 300KB
export const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─── فحص صحة بيانات البروفايل ───
export const validateProfileInput = (input: UpdateUserProfileInput): string => {
  const name = input.displayName.trim();
  if (!name) return "الاسم مطلوب";
  if (name.length < 2 || name.length > MAX_NAME_LENGTH) return "الاسم يجب أن يكون بين 2 و50 حرف";

  const phone = input.phone.trim();
  if (!phone) return "رقم الهاتف مطلوب";
  if (!isValidEgyptianPhone(phone)) return "رقم الهاتف غير صالح";

  const city = input.city.trim();
  if (!city) return "المدينة مطلوبة";
  if (city.length > MAX_CITY_LENGTH) return "اسم المدينة طويل جداً";

  if (input.address) {
    const addr = input.address.trim();
    if (addr.length > MAX_ADDRESS_LENGTH) return "العنوان طويل جداً";
  }

  if (input.age !== undefined) {
    if (typeof input.age !== "number" || !Number.isInteger(input.age) || input.age < MIN_AGE || input.age > MAX_AGE) {
      return `السن يجب أن يكون بين ${MIN_AGE} و ${MAX_AGE}`;
    }
  }

  if (input.gender && !["male", "female"].includes(input.gender)) {
    return "الجنس غير صالح";
  }

  return "";
};

// ─── فحص الصورة الأصلية ───
export const validateSourceImage = (file: File): string => {
  if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
    return "صيغة الصورة غير مدعومة (jpg, png, webp فقط)";
  }
  if (file.size > MAX_SOURCE_IMAGE_SIZE_BYTES) {
    return "حجم الصورة أكبر من 8 ميجابايت";
  }
  return "";
};

// ─── فحص الحجم بعد التصغير ───
export const validateUploadImageSize = (blob: Blob): string => {
  if (blob.size > MAX_UPLOAD_IMAGE_SIZE_BYTES) {
    return "تعذر تصغير الصورة لحجم مناسب، جرّب صورة أخرى";
  }
  return "";
};