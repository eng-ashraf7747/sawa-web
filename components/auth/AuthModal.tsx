"use client";

import { useState, useEffect } from "react";
import { AuthMode } from "@/types";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // تحديث آمن للـ mode عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>

        {/* Forms */}
        {mode === "login" && (
          <LoginForm
            onSuccess={onClose}
            onSwitchToRegister={() => setMode("register")}
            onForgotPassword={() => setMode("forgotPassword")}
          />
        )}

        {mode === "register" && (
          <RegisterForm
            onSuccess={onClose}
            onSwitchToLogin={() => setMode("login")}
          />
        )}

        {mode === "forgotPassword" && (
          <ForgotPasswordForm
            onBack={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
}