import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ErrorBoundary from "@/components/ErrorBoundary";
import PwaRegister from "@/components/shared/PwaRegister";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "سوا — معاً ندفع أقل",
  description: "منصة المفاوضة الجماعية — انضم لآلاف الأعضاء وادفع أقل",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-cairo)]">
        <PwaRegister />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}