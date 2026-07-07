// C:\sawa-web\components\layout\Footer.tsx
import Link from "next/link";
import { NAV_LINKS } from "@/constants";

export default function Footer() {
  const socialLinks = [
    {
      title: "Facebook",
      href: "https://www.facebook.com/Sawa.egy",
      active: true,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
        </svg>
      ),
    },
    {
      title: "Instagram",
      href: "#",
      active: false,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
    },
    {
      title: "TikTok",
      href: "#",
      active: false,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.77 0 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 100 12.67 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
        </svg>
      ),
    },
    {
      title: "YouTube",
      href: "#",
      active: false,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/>
        </svg>
      ),
    },
    {
      title: "Telegram",
      href: "#",
      active: false,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
        </svg>
      ),
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0d2447] px-4 md:px-6 lg:px-12 pt-7 pb-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-5 pb-5 border-b border-white/10">
          <div className="text-white font-bold text-base" style={{ fontFamily: "Inter, sans-serif" }}>
            SAWA<span className="text-[#c9a84c]">.</span>
          </div>

          <div className="flex gap-5 flex-wrap">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/50 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a84c] rounded"
              >
                {link.labelAr}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap" dir="ltr">
            <div className="flex gap-2">
              {socialLinks.map((s) => (
                s.active ? (
                  <a
                    key={s.title}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.title}
                    aria-label={s.title}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-[#1877f2] to-[#0c5bcd] hover:-translate-y-0.5 hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {s.icon}
                  </a>
                ) : (
                  <span key={s.title} className="relative group">
                    <button
                      type="button"
                      disabled
                      aria-label={`${s.title} — قريباً`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 bg-white/5 cursor-not-allowed"
                    >
                      {s.icon}
                    </button>
                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      قريباً
                    </span>
                  </span>
                )
              ))}
            </div>

            <div className="flex gap-2">
              {["🍎 App Store", "▶ Google Play"].map((b) => (
                <span key={b} className="relative group">
                  <button
                    type="button"
                    disabled
                    aria-label={`${b} — قريباً`}
                    className="text-[10px] text-white/30 border border-white/10 bg-white/5 rounded-md px-2.5 py-1 cursor-not-allowed"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {b}
                  </button>
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    قريباً
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-2 pt-3">
          <p className="text-[11px] text-white/25">
            © {currentYear} SAWA. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-white/25" style={{ fontFamily: "Inter, sans-serif" }}>
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#c9a84c]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"/>
            </svg>
            Protected & Secured
          </div>
        </div>
      </div>
    </footer>
  );
}