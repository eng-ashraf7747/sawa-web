// C:\sawa-web\components\home\ComingSoon.tsx

import { SERVICES } from "@/constants";

export default function ComingSoon() {
  return (
    <section className="bg-[#f8f9fb] py-12 md:py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0d2447]">الخدمات القادمة</h2>
            <p className="text-xs md:text-sm text-[#6b7280] mt-1">انضم دلوقتي واحجز مكانك قبل الإطلاق</p>
          </div>
          <span className="text-xs text-[#6b7280] hidden sm:inline" style={{ fontFamily: "Inter, sans-serif" }}>
            Coming Soon
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {SERVICES.map((service) => (
            <div key={service.id}
              className="bg-white rounded-2xl p-4 md:p-6 text-center border border-[#e8eaed] relative hover:-translate-y-1 hover:shadow-lg transition-all">
              <span className="absolute top-2.5 right-2.5 text-[10px] bg-[#f8f9fb] text-[#6b7280] px-2 py-0.5 rounded-full font-bold"
                style={{ fontFamily: "Inter, sans-serif" }}>
                SOON
              </span>
              <div className="text-2xl md:text-3xl mb-2 md:mb-3 grayscale opacity-30">{service.icon}</div>
              <div className="text-xs md:text-sm font-semibold text-[#bbb] mb-1">{service.nameAr}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}