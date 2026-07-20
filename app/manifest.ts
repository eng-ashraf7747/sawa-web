// C:\sawa-web\app\manifest.ts

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "سوا — SAWA",
    short_name: "سوا",
    description: "منصة سوا لخصومات التسوق الجماعي في الفيوم",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1a3c6e",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}