import Image from "next/image";

interface HeroProps {
  onRegisterClick: () => void;
}

export default function Hero({ onRegisterClick }: HeroProps) {
  return (
    <section className="max-w-6xl mx-auto px-12 pt-8 pb-0 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="inline-flex items-center gap-2 text-[#c9a84c] text-xs font-semibold uppercase tracking-widest mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
          <span className="w-6 h-0.5 bg-[#c9a84c]"/>
          Collective Power Platform
        </div>
        <h1 className="text-4xl md:text-5xl font-black leading-tight text-[#0d2447] mb-5">
          لوحدك بتدفع أكتر.<br/>
          مع <span className="text-[#c9a84c]">SAWA</span> بتدفع أقل.
        </h1>
        <p className="text-base text-[#6b7280] leading-relaxed mb-8 max-w-md">
          SAWA بتجمع أصحاب الاحتياجات المشتركة — وبتتفاوض بقوة المجموعة عشان تحصل على أفضل سعر وأعلى جودة في أي خدمة.
        </p>
        <div className="flex gap-3 flex-wrap mb-10">
          <button
            onClick={onRegisterClick}
            className="bg-[#1a3c6e] text-white px-8 py-3.5 rounded-xl font-bold text-base hover:bg-[#0d2447] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/25 transition-all cursor-pointer"
          >
            🚀 ابدأ مجاناً
          </button>
          <button className="border-2 border-[#1a3c6e] text-[#1a3c6e] px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-[#f8f9fb] transition-all cursor-pointer">
            اعرف أكتر
          </button>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          {["🔒 تسجيل آمن", "✅ مجاني 100%", "⚡ في 30 ثانية"].map((t, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs text-[#6b7280]">{t}</span>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-[500px]">
          <Image
            src="/Sawa-banner.png"

            alt="SAWA Characters"
            width={500}
            height={400}
            className="w-full rounded-2xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}