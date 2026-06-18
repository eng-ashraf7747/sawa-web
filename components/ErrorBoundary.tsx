"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]" dir="rtl">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-extrabold text-[#0d2447] mb-2">
              حدث خطأ غير متوقع
            </h2>
            <p className="text-sm text-[#6b7280] mb-6">
              نعتذر عن هذا الخطأ — يرجى إعادة تحميل الصفحة.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#1a3c6e] text-white rounded-xl font-bold text-sm hover:bg-[#0d2447] transition-colors cursor-pointer"
            >
              إعادة التحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}