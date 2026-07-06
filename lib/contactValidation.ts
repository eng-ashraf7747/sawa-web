// C:\sawa-web\lib\contactValidation.ts

import { isValidEmail, isValidEgyptianPhone } from "@/lib/validations";
import { CreateContactMessageInput } from "@/types/contact";

// ─── فحص صحة المُدخلات قبل الحفظ (منطق صرف، بلا أي اعتماد على Firebase) ───
export const validateContactMessageInput = (input: CreateContactMessageInput): string => {
  if (!input.contactValue.trim()) return "بيانات التواصل مطلوبة";

  if (input.method === "email" && !isValidEmail(input.contactValue)) {
    return "بريد إلكتروني غير صالح";
  }

  if (input.method === "whatsapp" && !isValidEgyptianPhone(input.contactValue)) {
    return "رقم واتساب غير صالح";
  }

  if (!input.message.trim()) return "نص الرسالة مطلوب";

  if (input.senderType === "guest" && !input.city) {
    return "المدينة مطلوبة";
  }

  return "";
};