// C:\sawa-web\app\membership\page.tsx

"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/auth/AuthModal";
import UnderConstruction from "@/components/shared/UnderConstruction";

export default function MembershipPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onLoginClick={() => setAuthModalOpen(true)} />

      <main className="flex-1 bg-[#f8fafc]">
        <UnderConstruction titleAr="العضوية" />
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}