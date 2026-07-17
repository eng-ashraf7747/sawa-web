// C:\sawa-web\components\dashboard\RequestsSection.tsx

"use client";

import { useState } from "react";
import { useUserRequests, useRequestActions } from "@/hooks/useRequests";
import { Request, REQUEST_STATUS_LABELS } from "@/types/request";
import RequestModal from "./RequestModal";

interface Props {
  userId: string;
  userName: string;
  userCity: string;
}

const RequestCard = ({
  request,
  onDelete,
  deleting,
}: {
  request: Request;
  onDelete: (id: string, subcategoryId: string) => void;
  deleting: boolean;
}) => (
  <div className="bg-white rounded-xl p-4 border border-[#e8eaed] shadow-sm hover:shadow-md hover:border-[#c9a84c] transition-all duration-200">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1 min-w-0">
        <p className="text-[#1a1a2e] font-bold text-sm truncate">{request.title}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {request.categoryName} — {request.subcategoryName}
        </p>
      </div>
      <button
        onClick={() => onDelete(request.id, request.subcategoryId)}
        disabled={deleting}
        className="text-gray-300 hover:text-red-400 transition text-lg mr-2 flex-shrink-0"
        title="حذف الطلب"
      >
        ✕
      </button>
    </div>

    {request.description && (
      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{request.description}</p>
    )}

    <div className="flex items-center justify-between">
      <span className="text-[#c9a84c] text-xs font-semibold">
        🔥 {request.interestedCount} شخص مهتم بنفس الطلب
      </span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        request.status === "pending"
          ? "bg-yellow-100 text-yellow-700"
          : request.status === "fulfilled"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}>
        {REQUEST_STATUS_LABELS[request.status]}
      </span>
    </div>
  </div>
);

export default function RequestsSection({ userId, userName, userCity }: Props) {
  const { requests, activeCount, remaining, loading, error, reload } = useUserRequests(userId);
  const { remove, loading: removing } = useRequestActions();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async (id: string, subcategoryId: string) => {
    await remove(id, subcategoryId);
    reload();
  };

  return (
    <div className="w-full md:w-[42%] flex-shrink-0">

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[#1a3c6e] text-lg font-extrabold">طلباتي</h2>
        <span className="bg-[#c9a84c] text-white text-xs font-bold px-3 py-1 rounded-full">
          {activeCount}
        </span>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm text-center py-4">{error}</p>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-4xl mb-3">📋</span>
          <p className="text-[#6b7280] text-sm">لم تسجّل أي طلبات بعد</p>
          <p className="text-[#c9a84c] text-xs mt-1">سجّل ما تحتاجه وسوا ستوفره لك</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onDelete={handleDelete}
              deleting={removing}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        disabled={remaining === 0}
        className={`w-full mt-4 py-3 border-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer
          ${remaining === 0
            ? "border-gray-200 text-gray-300 cursor-not-allowed"
            : "border-[#1a3c6e] text-[#1a3c6e] hover:bg-[#1a3c6e] hover:text-white"
          }`}
      >
        {remaining === 0
          ? "وصلت للحد الأقصى من الطلبات"
          : `+ سجّل اهتمامك بخدمة جديدة (${remaining} متبقية)`
        }
      </button>

      {showModal && (
        <RequestModal
          userId={userId}
          userName={userName}
          userCity={userCity}
          remaining={remaining}
          onClose={() => setShowModal(false)}
          onSubmitted={reload}
        />
      )}

    </div>
  );
}