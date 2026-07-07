// C:\sawa-web\components\shared\UnderConstruction.tsx

import Link from "next/link";

interface UnderConstructionProps {
  titleAr: string;
  descriptionAr?: string;
}

export default function UnderConstruction({ titleAr, descriptionAr }: UnderConstructionProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 md:px-6 lg:px-8 py-16">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#f8f9fb] border border-[#e8eaed] flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 md:w-10 md:h-10 text-[#c9a84c]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>

      <span className="text-[10px] md:text-xs font-bold bg-[#c9a84c] text-[#1a3c6e] px-2.5 py-1 rounded-full mb-4">
        قيد الإنشاء
      </span>

      <h1 className="text-xl md:text-3xl font-extrabold text-[#0d2447] mb-3">
        {titleAr}
      </h1>

      <p className="text-sm md:text-base text-[#6b7280] max-w-md mb-8">
        {descriptionAr || "هذه الصفحة قيد التجهيز حالياً، وسيتم إطلاقها قريباً."}
      </p>

      <Link
        href="/"
        className="text-sm font-semibold text-white bg-[#1a3c6e] px-5 py-2.5 rounded-xl hover:bg-[#0d2447] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a84c]"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}