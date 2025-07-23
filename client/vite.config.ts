import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // server: {
  //   port: 5173,
  //   host: "react.dev.lo",
  // },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      target: "vercel",
      customViteReactPlugin: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: "NineHertz Dashboard",
        short_name: "NineHertzDashboard",
        theme_color: "#22c55e",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),

    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ["stream-chat", "stream-chat-react"],
  },
});
