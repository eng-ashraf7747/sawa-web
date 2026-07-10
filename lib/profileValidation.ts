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
export const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 ميجابايت
export const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const validateProfileInput = (input: UpdateUserProfileInput): string => {
  const name = input.displayName.trim();
  if (!name) return "الاسم مطلوب";
  if (name.length < 2 || name.length > 50) return "الاسم يجب أن يكون بين 2 و50 حرف";

  if (!input.phone.trim()) return "رقم الهاتف مطلوب";
  if (!isValidEgyptianPhone(input.phone)) return "رقم الهاتف غير صالح";

  const city = input.city.trim();
  if (!city) return "المدينة مطلوبة";

  if (input.age !== undefined) {
    if (!Number.isInteger(input.age) || input.age < MIN_AGE || input.age > MAX_AGE) {
      return `السن يجب أن يكون بين ${MIN_AGE} و ${MAX_AGE}`;
    }
  }

  if (input.gender && !["male", "female"].includes(input.gender)) {
    return "الجنس غير صالح";
  }

  return "";
};

export const validateProfileImage = (file: File): string => {
  if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
    return "صيغة الصورة غير مدعومة (jpg, png, webp فقط)";
  }
  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    return "حجم الصورة أكبر من 2 ميجابايت";
  }
  return "";
};