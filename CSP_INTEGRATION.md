# Интеграция Content Security Policy (CSP)

Интеграция CSP в проект для обеспечения безопасности приложения.

## Описание

Система автоматически генерирует nonce для каждого HTML запроса и устанавливает соответствующие заголовки Content-Security-Policy.

## Переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# URL BFF сервера (обязательно для connect-src)
VITE_BFF_URL=https://api.example.com

# Дополнительные источники для изображений (через запятую)
VITE_CSP_IMG_SRC=https://cdn.example.com,https://images.example.com

# Дополнительные источники для connect-src (через запятую)
# Если не задано, в dev режиме автоматически добавляются домены fr0.me:
# - https://dev-bff.fr0.me
# - https://bff.fr0.me
# - https://fr0.me
VITE_CSP_CONNECT_SRC=https://api.example.com,https://analytics.example.com
```

**Примечание:** В dev режиме, если `VITE_CSP_CONNECT_SRC` не задан, автоматически добавляются домены `fr0.me` для поддержки dev окружения.

## Использование

### Режим разработки

В режиме разработки CSP автоматически применяется через Vite плагин:

```bash
npm run dev
```

Плагин автоматически:
- Генерирует nonce для каждого запроса
- Добавляет nonce к script тегам
- Устанавливает CSP заголовки

### Продакшен режим

1. Соберите проект:
```bash
npm run build
```

2. Запустите сервер:
```bash
npm run start
```

Или для продакшена (после компиляции):
```bash
npm run start:prod
```

## Настройка порта и хоста

Используйте переменные окружения:

```env
PORT=7202
HOST=0.0.0.0
APP_PORT=7202  # альтернатива для PORT
```

## Структура CSP

CSP включает следующие директивы:

- `default-src 'self'` - по умолчанию только с того же источника
- `script-src 'self' https://telegram.org 'nonce-{nonce}'` - скрипты с nonce
- `style-src 'self' 'unsafe-inline'` - стили (inline разрешен)
- `img-src 'self' data: https://telegram.org https://oauth.telegram.org` - изображения
- `connect-src 'self' {BFF_ORIGIN}` - подключения к API
- `frame-src https://oauth.telegram.org https://telegram.org` - фреймы
- `upgrade-insecure-requests` - автоматическое обновление HTTP до HTTPS

## Важные замечания

1. **Nonce в HTML**: В `index.html` используется placeholder `{{NONCE}}`, который автоматически заменяется на реальный nonce.

2. **Script теги**: Все script теги автоматически получают атрибут `nonce`.

3. **Статические файлы**: Статические файлы из `dist/` обслуживаются без CSP заголовков (только HTML получает CSP).

4. **BFF URL**: Убедитесь, что `VITE_BFF_URL` правильно настроен, иначе запросы к API могут блокироваться CSP.

