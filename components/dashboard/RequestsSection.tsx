"use client";

interface Request {
  id: string;
  title: string;
  icon: string;
  current: number;
  target: number;
}

interface RequestsSectionProps {
  requests: Request[];
}

const RequestCard = ({ request }: { request: Request }) => {
  const progress = (request.current / request.target) * 100;

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e8eaed] shadow-sm hover:shadow-md hover:border-[#c9a84c] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{request.icon}</span>
          <span className="text-[#1a1a2e] font-bold text-sm">{request.title}</span>
        </div>
        <span className="text-[#c9a84c] text-xs font-bold">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#f0f4f8] rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-[#c9a84c] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[#6b7280] text-xs text-right">
        {request.current} من {request.target} مهتم
      </p>
    </div>
  );
};

export default function RequestsSection({ requests }: RequestsSectionProps) {
  return (
    <div className="w-[42%] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[#1a3c6e] text-lg font-extrabold">طلباتي</h2>
        <span className="bg-[#c9a84c] text-white text-xs font-bold px-3 py-1 rounded-full">
          {requests.length}
        </span>
      </div>

      {/* List */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📋</span>
          <p className="text-[#6b7280] text-sm">لم تسجّل أي طلبات بعد</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}

      {/* Add Request Button */}
      <button className="w-full mt-4 py-3 border-2 border-[#1a3c6e] text-[#1a3c6e] rounded-xl text-sm font-bold hover:bg-[#1a3c6e] hover:text-white transition-all duration-200 cursor-pointer">
        + سجّل اهتمامك بخدمة جديدة
      </button>
    </div>
  );
}