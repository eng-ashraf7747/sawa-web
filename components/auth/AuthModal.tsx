"use client";
import { useState } from "react";
import { AuthMode } from "@/types";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}

export default function AuthModal({ isOpen, initialMode = "login", onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-9 w-full max-w-sm shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-[#f8f9fb] flex items-center justify-center text-[#6b7280] hover:bg-[#e8eaed] transition-colors cursor-pointer text-sm"
        >
          ✕
        </button>

        {mode === "login" ? (
          <LoginForm
            onSuccess={onClose}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onSuccess={onClose}
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
}