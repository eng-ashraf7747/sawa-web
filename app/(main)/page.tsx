"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthMode } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ComingSoon from "@/components/home/ComingSoon";
import Tagline from "@/components/home/Tagline";
import AuthModal from "@/components/auth/AuthModal";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useUser();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  const openLogin = () => { setAuthMode("login"); setAuthOpen(true); };
  const openRegister = () => { setAuthMode("register"); setAuthOpen(true); };

  if (loading) return null;
  if (isAuthenticated) return null;

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