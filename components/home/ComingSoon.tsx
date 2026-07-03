// C:\sawa-web\components\home\ComingSoon.tsx

import { SERVICES } from "@/constants";

export default function ComingSoon() {
  return (
    <section className="bg-[#f8f9fb] py-12 md:py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* ─── المربع العلوي (التغيير هنا فقط) ─── */}
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div className="flex justify-center items-center gap-5 flex-wrap">
            <a href="#" className="text-xs text-[#6b7280] hover:text-[#1a3c6e] transition-colors">كيف تعمل؟</a>
            <a href="#" className="text-xs text-[#6b7280] hover:text-[#1a3c6e] transition-colors">العضوية</a>
            <a href="#" className="text-xs text-[#6b7280] hover:text-[#1a3c6e] transition-colors">لأصحاب الأعمال</a>
            <a href="/contact" className="text-xs text-[#c9a84c] hover:text-[#1a3c6e] font-semibold transition-colors">تواصل معنا</a>
          </div>
          <span className="text-xs text-[#6b7280] hidden sm:inline" style={{ fontFamily: "Inter, sans-serif" }}>
            Coming Soon
          </span>
        </div>

        {/* ─── شبكة الخدمات (كما هي بالضبط بدون أي تغيير) ─── */}
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

        {/* ─── لنبني مجتمعنا سوا (كما هو بالضبط بدون أي تغيير) ─── */}
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#0d2447]">لنبني مجتمعنا <span className="text-[#c9a84c]">سوا</span></h2>
          </div>
        </div>
      </div>
    </section>
  );
}