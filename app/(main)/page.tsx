"use client";
import { useState } from "react";
import { AuthMode } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ComingSoon from "@/components/home/ComingSoon";
import Tagline from "@/components/home/Tagline";
import AuthModal from "@/components/auth/AuthModal";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const openLogin = () => { setAuthMode("login"); setAuthOpen(true); };
  const openRegister = () => { setAuthMode("register"); setAuthOpen(true); };

  return (
    <div dir="rtl" className="min-h-screen bg-white text-[#111827] overflow-x-hidden">
      <Navbar onLoginClick={openLogin} />
      <Hero onRegisterClick={openRegister} />
      <ComingSoon />
      <Tagline />
      <Footer />
      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}