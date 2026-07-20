// C:\sawa-web\components\shared\ContactForm.tsx

"use client";

import { useContactForm } from "@/hooks/useContactForm";
import { useCities } from "@/hooks/useCities";
import {
  ContactMessageMethod,
  ContactMessageCategory,
  CONTACT_MESSAGE_CATEGORY_LABELS,
  CONTACT_MESSAGE_METHOD_LABELS,
} from "@/types/contact";

const categoryEntries = Object.entries(CONTACT_MESSAGE_CATEGORY_LABELS) as [
  ContactMessageCategory,
  string
][];

const methodEntries: [ContactMessageMethod, string][] = [
  ["whatsapp", CONTACT_MESSAGE_METHOD_LABELS.whatsapp],
  ["email", CONTACT_MESSAGE_METHOD_LABELS.email],
];

export default function ContactForm() {
  const { cities } = useCities();
  const {
    senderType,
    form,
    updateField,
    setMethod,
    isNameEditable,
    showCityField,
    isContactValueEditable,
    vendorBadge,
    touched,
    submitting,
    error,
    modal,
    submit,
    requestCancel,
    confirmCancel,
    dismissCancelConfirm,
    goHome,
  } = useContactForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const contactValueLabel =
    form.method === "whatsapp" ? "رقم الواتساب" : "البريد الإلكتروني";

  const contactValuePlaceholder =
    form.method === "whatsapp" ? "01xxxxxxxxx" : "name@example.com";

  return (
    <div className="px-4 md:px-6 lg:px-8 py-10 flex justify-center" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-lg md:text-xl font-bold text-[#1a3c6e]">تواصل معنا</h1>
          <p className="text-sm text-gray-400 mt-1">
            يسعدنا استقبال استفساراتكم وملاحظاتكم
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 flex flex-col gap-4"
        >
          {/* الاسم */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              الاسم {isNameEditable && <span className="text-gray-400">(اختياري)</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={!isNameEditable}
                placeholder="اكتب اسمك"
                className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none transition
                  ${
                    isNameEditable
                      ? "border-gray-200 focus:border-[#1a3c6e]"
                      : "border-gray-100 bg-gray-50 text-gray-500"
                  }`}
              />
              {vendorBadge && (
                <span className="flex-shrink-0 bg-[#c9a84c] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  مورد
                </span>
              )}
            </div>
          </div>

          {/* المدينة — للزائر فقط، بانتقال Fade */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showCityField ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              المدينة
            </label>
            <select
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              required={showCityField}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1a3c6e] bg-white"
            >
              <option value="">اختر المدينة</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* وسيلة التواصل */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              وسيلة التواصل
            </label>
            <div className="flex gap-2 mb-3">
              {methodEntries.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition
                    ${
                      form.method === value
                        ? "bg-[#1a3c6e] text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="transition-opacity duration-300" key={form.method}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                {contactValueLabel}
              </label>
              <input
                type={form.method === "email" ? "email" : "tel"}
                value={form.contactValue}
                onChange={(e) => updateField("contactValue", e.target.value)}
                disabled={!isContactValueEditable}
                placeholder={contactValuePlaceholder}
                required
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition
                  ${
                    isContactValueEditable
                      ? "border-gray-200 focus:border-[#1a3c6e]"
                      : "border-gray-100 bg-gray-50 text-gray-500"
                  }`}
              />
            </div>
          </div>

          {/* نوع الرسالة */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              نوع الرسالة
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                updateField("category", e.target.value as ContactMessageCategory)
              }
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1a3c6e] bg-white"
            >
              {categoryEntries.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* الرسالة */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              رسالتك
            </label>
            <textarea
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="اكتب رسالتك هنا"
              required
              rows={4}
              maxLength={1000}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#1a3c6e] resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-2.5 mt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#1a3c6e] hover:bg-[#15306a] text-white font-semibold rounded-xl py-2.5 text-sm transition disabled:opacity-50"
            >
              {submitting ? "جاري الإرسال..." : "إرسال الرسالة"}
            </button>
            <button
              type="button"
              onClick={requestCancel}
              disabled={submitting}
              className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-semibold rounded-xl py-2.5 text-sm transition disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>

      {/* Modal نجاح الإرسال */}
      {modal === "success" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center">
            <p className="text-base font-bold text-[#1a3c6e] mb-1">تم إرسال رسالتك بنجاح ✓</p>
            <p className="text-xs text-gray-400 mb-5">هل تريد العودة للرئيسية؟</p>
            <div className="flex gap-2.5">
              <button
                onClick={goHome}
                className="flex-1 bg-[#1a3c6e] text-white font-semibold rounded-xl py-2.5 text-sm"
              >
                نعم
              </button>
              <button
                onClick={dismissCancelConfirm}
                className="flex-1 border border-gray-200 text-gray-500 font-semibold rounded-xl py-2.5 text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal تأكيد الإلغاء */}
      {modal === "cancelConfirm" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center">
            <p className="text-base font-bold text-[#1a3c6e] mb-1">إلغاء الرسالة؟</p>
            <p className="text-xs text-gray-400 mb-5">
              هل أنت متأكد؟ سيتم فقدان البيانات المدخلة.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={confirmCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-2.5 text-sm transition"
              >
                نعم، إلغاء
              </button>
              <button
                onClick={dismissCancelConfirm}
                className="flex-1 border border-gray-200 text-gray-500 font-semibold rounded-xl py-2.5 text-sm"
              >
                الاستمرار في الكتابة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}