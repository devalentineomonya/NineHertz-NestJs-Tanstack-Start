import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // server: {
  //   port: 5173,
  //   host: "react.dev.lo",
  // },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      manifest: {
        name: "NineHertz Admin Dashboard",
        short_name: "NineAdmin",
        description:
          "Secure admin portal for managing NineHertz Medical System",
        theme_color: "#22c55e",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/auth/signin",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,svg,woff2}"],
        globDirectory: "dist",
        skipWaiting: true,
        clientsClaim: true,
        offlineGoogleAnalytics: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(cdn|fonts|api)\./,
            handler: "CacheFirst",
            options: {
              cacheName: "external-assets",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /\.(?:js|css|html)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets",
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-assets",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          // Offline fallback route
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "offline-fallback",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
              },
              plugins: [
                {
                  cacheWillUpdate: async ({ response }) => {
                    if (response.status >= 400) {
                      return null;
                    }
                    return response;
                  },
                },
              ],
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  optimizeDeps: {
    include: ["stream-chat", "stream-chat-react"],
  },
});
