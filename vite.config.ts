import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import type { Connect, Plugin } from 'vite';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import type { DomainConfig } from '@shared/services/vault/types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DEV_PORT = 5173;

/**
 * Загрузка переменных окружения из .env файла
 */
function loadEnvVars(): void {
  // Загружаем .env файл
  const envPath = path.resolve(process.cwd(), '.env');

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

/**
 * Vite middleware для предоставления конфигурации доменов
 * Работает только в dev режиме
 */
function domainsConfigMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    // Обрабатываем только запросы к /api/domains/config
    if (req.url !== '/api/domains/config' || req.method !== 'GET') {
      next();

      return;
    }

    try {
      // Динамический импорт для работы только на сервере
      const { getServerDomainConfigManager } = await import('./src/server/domains/domainConfigManager');
      const manager = getServerDomainConfigManager();

      // Инициализируем менеджер, если еще не инициализирован
      if (!manager.getConfig()) {
        await manager.initialize();
      }

      const config = manager.getConfig();

      if (!config) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Domain config not available' }));

        return;
      }

      // Фильтруем конфигурацию для клиента - возвращаем только enabled домены
      // и только необходимые поля (без внутренних данных)
      const publicConfig = {
        default_domain: config.default_domain,
        domains: config.domains
          .filter((d: DomainConfig) => d.enabled)
          .map((d: DomainConfig) => ({
            bff_host: d.bff_host,
            login_host: d.login_host,
            login_return_hosts: d.login_return_hosts,
            tg_bot_name: d.tg_bot_name,
            web_host: d.web_host,
            cookie_domain: d.cookie_domain,
            csp: d.csp,
            name: d.name,
          })),
        version: config.version,
      };

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Кэшируем на 1 час
        // Добавляем CORS заголовки для безопасности
        'Access-Control-Allow-Origin': '*', // В production заменить на конкретные домены
        'Access-Control-Allow-Methods': 'GET',
      });
      res.end(JSON.stringify(publicConfig));
    } catch (error) {
      console.error('Failed to get domain config:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(error) }));
    }
  };
}

// Плагин для предоставления конфигурации доменов в dev режиме
function domainsConfigPlugin(): Plugin {
  return {
    name: 'domains-config',
    configResolved() {
      // Загружаем переменные окружения при инициализации конфига
      loadEnvVars();
    },
    configureServer(server) {
      // Инициализируем менеджер при старте сервера
      import('./src/server/domains/domainConfigManager')
        .then(({ getServerDomainConfigManager }) => {
          const manager = getServerDomainConfigManager();

          manager.initialize().catch(err => {
            console.error('Failed to initialize domain config manager:', err);
          });
        })
        .catch(err => {
          console.error('Failed to load domain config manager:', err);
        });

      server.middlewares.use(domainsConfigMiddleware());
    },
  };
}

// Загружаем переменные окружения перед экспортом конфига
loadEnvVars();

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
    domainsConfigPlugin(),
  ],
  server: (() => {
    const DEV_HOST = process.env.DEV_HOST || '0.0.0.0';
    const port = Number(process.env.DEV_PORT || DEFAULT_DEV_PORT);

    // Приоритет: сначала wildcard сертификат для всех поддоменов, затем базовый
    const certCandidates = [
      ['_wildcard.fr0.me+2.pem', '_wildcard.fr0.me+2-key.pem'], // Wildcard для *.fr0.me, login.fr0.me, fr0.me
      ['fr0.me.pem', 'fr0.me-key.pem'], // Базовый сертификат для fr0.me
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
