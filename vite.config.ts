import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/favicon-32.png",
        "icons/apple-touch-icon.png",
        "og-image.jpg",
        "robots.txt",
        "sitemap.xml",
      ],
      manifest: {
        name: "BlockFall - Mobile Tetris",
        short_name: "BlockFall",
        description:
          "A fast, mobile-first falling block puzzle game with marathon, sprint, ultra, daily challenges, achievements, and leaderboards.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#050816",
        theme_color: "#0A0A0F",
        categories: ["games", "entertainment"],
        icons: [
          {
            src: "/icons/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/og-image.jpg",
            sizes: "1254x1254",
            type: "image/jpeg",
            form_factor: "narrow",
            label: "BlockFall splash art",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,webmanifest}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
});
