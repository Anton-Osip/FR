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
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
  server: (() => {
    const DEV_HOST = process.env.DEV_HOST || '0.0.0.0';
    const port = Number(process.env.DEV_PORT || DEFAULT_DEV_PORT);

    // Выбираем подходящую пару сертификатов: сначала dev-webapp, потом localhost.
    const certCandidates = [
      ['dev-webapp.fr0.me+3.pem', 'dev-webapp.fr0.me+3-key.pem'],
      ['dev-webapp+2.pem', 'dev-webapp+2-key.pem'],
      ['localhost+2.pem', 'localhost+2-key.pem'],
    ];
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
      { find: '@shared', replacement: path.resolve(__dirname, 'src/shared') },
      { find: '@widgets', replacement: path.resolve(__dirname, 'src/widgets') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
    ],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
});
