// C:\sawa-web\components\admin\ImageUpload.tsx

"use client";

import { useState, useRef } from "react";
import { uploadImage } from "@/lib/storage";

interface ImageUploadProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
  folder?: string;
}

export default function ImageUpload({
  currentUrl,
  onUpload,
  folder = "deals",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // ─── التحقق من النوع والحجم ──────────────────────────
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار صورة فقط");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("حجم الصورة يجب أن يكون أقل من 2MB");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const path = `${folder}/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path, setProgress);
      onUpload(url);
    } catch {
      setError("حدث خطأ في رفع الصورة — حاول مرة أخرى");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        الصورة
      </label>

      {/* ─── Preview ─────────────────────────────────────── */}
      {currentUrl && (
        <div className="relative mb-3 w-full h-36 rounded-xl overflow-hidden border border-slate-200">
          <img src={currentUrl} alt="preview" className="w-full h-full object-cover" />
          <button
            onClick={() => onUpload("")}
            className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ─── Upload Area ──────────────────────────────────── */}
      {!currentUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#1a3c6e] hover:bg-slate-50 transition"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-[#1a3c6e] border-t-[#c9a84c] rounded-full animate-spin" />
              <p className="text-xs text-slate-500">{progress}%</p>
            </div>
          ) : (
            <>
              <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-slate-500">اسحب صورة هنا أو اضغط للاختيار</p>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG حتى 2MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* ─── Error ───────────────────────────────────────── */}
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}