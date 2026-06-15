export default function Footer() {
  const socialLinks = [
    {
      cls: "bg-gradient-to-br from-[#1877f2] to-[#0c5bcd]",
      title: "Facebook",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
        </svg>
      ),
    },
    {
      cls: "bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888]",
      title: "Instagram",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      ),
    },
    {
      cls: "bg-gradient-to-br from-[#2d2d2d] to-[#010101]",
      title: "TikTok",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.77 0 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 100 12.67 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
        </svg>
      ),
    },
    {
      cls: "bg-gradient-to-br from-[#ff0000] to-[#cc0000]",
      title: "YouTube",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#ff0000"/>
        </svg>
      ),
    },
    {
      cls: "bg-gradient-to-br from-[#2aabee] to-[#1a8ecb]",
      title: "Telegram",
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2">
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-[#0d2447] px-12 pt-7 pb-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-5 pb-5 border-b border-white/10">
          <div className="text-white font-bold text-base" style={{ fontFamily: "Inter, sans-serif" }}>
            SAWA<span className="text-[#c9a84c]">.</span>
          </div>

          <div className="flex gap-5 flex-wrap">
            {["كيف تعمل؟", "العضوية", "لأصحاب الأعمال", "تواصل معنا"].map((link, i) => (
              <a key={i} href="#" className="text-xs text-white/50 hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap" dir="ltr">
            <div className="flex gap-2">
              {socialLinks.map((s, i) => (
                <a key={i} href="#" title={s.title}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center hover:-translate-y-0.5 hover:shadow-lg transition-all ${s.cls}`}>
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="flex gap-2">
              {["🍎 App Store", "▶ Google Play"].map((b, i) => (
                <button key={i}
                  className="text-[10px] text-white/60 border border-white/10 bg-white/5 rounded-md px-2.5 py-1 hover:bg-white/10 transition-colors cursor-pointer"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-2 pt-3">
          <p className="text-[11px] text-white/25">© 2025 SAWA. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-[11px] text-white/25" style={{ fontFamily: "Inter, sans-serif" }}>
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#c9a84c]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"/>
            </svg>
            Protected & Secured
          </div>
        </div>
      </div>
    </footer>
  );
}