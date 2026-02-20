import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DEV_PORT = 5173;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    svgr({
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: true,
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  // Отключаем удаление viewBox, чтобы SVG масштабировались правильно
                  removeViewBox: false,
                },
              },
            },
            // Удаляем ненужные атрибуты
            'removeXMLNS',
          ],
        },
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
  server: (() => {
    const DEV_HOST = process.env.DEV_HOST || '0.0.0.0';
    const port = Number(process.env.DEV_PORT || DEFAULT_DEV_PORT);

    const certCandidates = [['fr0.me.pem', 'fr0.me-key.pem']];
    const pair = certCandidates.find(([c, k]) => {
      const certPath = path.resolve(__dirname, c);
      const keyPath = path.resolve(__dirname, k);

      return fs.existsSync(certPath) && fs.existsSync(keyPath);
    });

    const https =
      pair &&
      ((): { cert: Buffer; key: Buffer } => {
        const [c, k] = pair;

        return {
          cert: fs.readFileSync(path.resolve(__dirname, c)),
          key: fs.readFileSync(path.resolve(__dirname, k)),
        };
      })();

    const httpsOption = https || undefined;

    return {
      host: DEV_HOST,
      port,
      ...(httpsOption ? { https: httpsOption } : {}),
      proxy: {
        // Dev-прокси для варианта с относительным BFF (`VITE_API_BASE_URL=/bff`).
        '/bff': {
          target: 'https://dev-bff.fr0.me',
          changeOrigin: true,
          secure: true,
          rewrite: p => p.replace(/^\/bff/, ''),
        },
      },
    };
  })(),
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@app', replacement: path.resolve(__dirname, 'src/app') },
      { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@widgets', replacement: path.resolve(__dirname, 'src/widgets') },
      { find: '@features', replacement: path.resolve(__dirname, 'src/features') },
      { find: '@entities', replacement: path.resolve(__dirname, 'src/entities') },
      { find: '@shared', replacement: path.resolve(__dirname, 'src/shared') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/shared/assets') },
    ],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // UI libraries (Radix UI)
          'vendor-ui': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-icons',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-separator',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // Forms and validation
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // i18n
          'vendor-i18n': [
            'i18next',
            'react-i18next',
            'i18next-http-backend',
            'i18next-browser-languagedetector',
            'i18next-intervalplural-postprocessor',
          ],
          // Other utilities
          'vendor-utils': ['clsx', 'lottie-react', 'swiper'],
        },
      },
    },
  },
});
