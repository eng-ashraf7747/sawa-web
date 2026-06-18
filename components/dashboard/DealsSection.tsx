"use client";

interface Deal {
  id: string;
  title: string;
  discount: string;
  icon: string;
  members: number;
  maxMembers: number;
}

interface DealsSectionProps {
  deals: Deal[];
}

const DealCard = ({ deal }: { deal: Deal }) => {
  const progress = (deal.members / deal.maxMembers) * 100;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#e8eaed] shadow-sm hover:shadow-md hover:border-[#c9a84c] transition-all duration-200 group">
      {/* Icon + Title */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{deal.icon}</span>
        <span className="text-xs bg-[#f0f4f8] text-[#6b7280] px-2 py-1 rounded-full">
          {deal.members} عضو
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[#1a1a2e] font-bold text-sm mb-2 text-right">
        {deal.title}
      </h3>

      {/* Discount */}
      <p className="text-[#c9a84c] text-2xl font-extrabold text-right mb-3">
        خصم {deal.discount}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="w-full h-1.5 bg-[#f0f4f8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c9a84c] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[#6b7280] text-xs mt-1 text-right">
          {deal.members} من {deal.maxMembers} مهتم
        </p>
      </div>

      {/* Button */}
      <button className="w-full py-2.5 bg-[#1a3c6e] text-white rounded-xl text-sm font-bold hover:bg-[#c9a84c] hover:text-[#1a3c6e] transition-all duration-200 cursor-pointer">
        انضم الآن
      </button>
    </div>
  );
};

export default function DealsSection({ deals }: DealsSectionProps) {
  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[#1a3c6e] text-lg font-extrabold">العروض المتاحة</h2>
        <span className="bg-[#c9a84c] text-white text-xs font-bold px-3 py-1 rounded-full">
          {deals.length}
        </span>
      </div>

      {/* Grid */}
      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">🏷️</span>
          <p className="text-[#6b7280] text-sm">لا توجد عروض متاحة حالياً</p>
          <p className="text-[#c9a84c] text-xs mt-1">سجّل اهتمامك بالخدمات لتفعيل العروض</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}