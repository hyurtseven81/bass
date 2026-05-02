import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

// GH Pages site: https://hyurtseven81.github.io/bass/
// `base` must match the repo name; trailing slash everywhere keeps fetches consistent.
export default defineConfig({
  site: 'https://hyurtseven81.github.io',
  base: '/bass',
  trailingSlash: 'always',
  // Disable HTML compression — strips leading whitespace inside .chord-line divs
  // which destroys chord-over-syllable positioning in the setlist.
  compressHTML: false,
  build: {
    assets: 'assets',
  },
  integrations: [
    AstroPWA({
      // Regenerates SW on every new build; clients update on next page load.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.svg'],
      manifest: {
        name: 'Bass — Cheat Sheets & Setlist',
        short_name: 'Bass',
        description: 'Bass guitar references — jazz theory, stage setlist, natural harmonics',
        lang: 'en',
        theme_color: '#d4a853',
        background_color: '#07080c',
        display: 'standalone',
        start_url: '/bass/',
        scope: '/bass/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Pre-cache everything needed for full offline use on stage.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        navigateFallback: '/bass/',
        // Cache Google Fonts at runtime — first load online, cached thereafter.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
