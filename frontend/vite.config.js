import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt"],
      manifest: {
        id: "/",
        name: "Financial-D3v",
        short_name: "Financial-D3v",
        description: "Private personal finance and financial learning workspace",
        lang: "es-CO",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#0b0d10",
        background_color: "#0b0d10",
        categories: ["finance", "productivity"],
        icons: [
          {
            src: "/favicon.svg",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/favicon.svg",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/",
      },
    }),
  ],
});
