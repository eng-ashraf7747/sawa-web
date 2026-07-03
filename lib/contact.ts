// FILE: lib/contact.ts

/**
 * Contact Service - Sawa Project
 * Handles user messages submission (Support Ticket System)
 * Fully platform-independent (works in web / mobile / tablet)
 */

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";


// ===============================
// TYPES
// ===============================

export type ContactCategory =
  | "استفسار عام"
  | "مشكلة تقنية في الموقع"
  | "أرغب في التسجيل كمورد"
  | "اقتراح فكرة جديدة"
  | "شكوى"
  | "أخرى";

export type ContactMethod = "email" | "whatsapp";

export type SenderType = "عضو" | "زائر" | "مورد";


// ===============================
// INPUT MODEL
// ===============================

export interface ContactMessageInput {
  userId?: string | null;

  name: string;
  email?: string | null;
  phone?: string | null;
  city: string;

  category: ContactCategory;
  message: string;

  contactMethod: ContactMethod;
}


// ===============================
// VALIDATION LAYER
// ===============================

/**
 * Validates contact form input before submission
 */
function validateContactInput(data: ContactMessageInput): string | null {
  if (!data.message || data.message.trim().length < 10) {
    return "الرسالة يجب أن تكون 10 أحرف على الأقل";
  }

  if (!data.name) {
    return "الاسم مطلوب";
  }

  if (!data.city) {
    return "المدينة مطلوبة";
  }

  if (data.contactMethod === "email") {
    if (!data.email) {
      return "البريد الإلكتروني مطلوب";
    }
  }

  if (data.contactMethod === "whatsapp") {
    if (!data.phone || data.phone.trim().length < 10) {
      return "رقم الهاتف غير صحيح";
    }
  }

  return null;
}


// ===============================
// MAPPING LAYER
// ===============================

/**
 * Determines sender type based on authentication state
 */
function mapSenderType(userId?: string | null): SenderType {
  if (userId) return "عضو";
  return "زائر";
}


// ===============================
// DOCUMENT BUILDER
// ===============================

/**
 * Builds Firestore document structure
 */
function buildContactDoc(data: ContactMessageInput) {
  const senderType = mapSenderType(data.userId);

  return {
    userId: data.userId || null,
    senderType,

    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    city: data.city,

    category: data.category,
    message: data.message,

    contactMethod: data.contactMethod,
    contactValue:
      data.contactMethod === "email"
        ? data.email
        : data.phone,

    status: "مفتوحة",

    topicImportance: 0,
    userImportance: 0,

    adminNotes: null,
    adminLog: null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}


// ===============================
// PUBLIC API
// ===============================

/**
 * Submit contact message to Firestore
 */
export async function submitContactMessage(
  data: ContactMessageInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validationError = validateContactInput(data);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Build document
    const doc = buildContactDoc(data);

    // Save to Firestore
    await addDoc(collection(db, "contact_messages"), doc);

    return { success: true };

  } catch (error) {
    console.error("CONTACT_SERVICE_ERROR:", error);

    return {
      success: false,
      error: "حدث خطأ أثناء إرسال الرسالة",
    };
  }
}