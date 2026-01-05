import { BFF } from '@/shared/config';

const sockets: Map<string, WebSocket> = new Map();
const reconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
const reconnectDelays: Map<string, number> = new Map();

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;
const RECONNECT_EXPONENT = 1.5;

function getWebSocketUrl(path: string): string {
  const httpUrl = `${BFF}${path}`;

  try {
    const url = new URL(httpUrl);

    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

    return url.toString();
  } catch {
    return httpUrl.replace(/^https?:/, httpUrl.startsWith('https') ? 'wss:' : 'ws:');
  }
}

function scheduleReconnect(path: string): void {
  if (reconnectTimers.has(path)) return;

  const currentDelay = reconnectDelays.get(path) || RECONNECT_BASE_DELAY_MS;
  const newDelay = Math.min(Math.floor(currentDelay * RECONNECT_EXPONENT), RECONNECT_MAX_DELAY_MS);

  reconnectDelays.set(path, newDelay);

  const timer = setTimeout(() => {
    reconnectTimers.delete(path);
    if (!sockets.has(path)) {
      // Создаем новое соединение только если его еще нет
      getSocket(path);
    }
  }, currentDelay);

  reconnectTimers.set(path, timer);
}

export const getSocket = (path: string): WebSocket => {
  if (!sockets.has(path)) {
    const url = getWebSocketUrl(path);
    const socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      console.log(`✅ Подключен к серверу: ${path}`);
      reconnectDelays.set(path, RECONNECT_BASE_DELAY_MS);
      reconnectTimers.delete(path);
    });

    socket.addEventListener('close', event => {
      console.log(`❌ Соединение разорвано: ${path}`, { code: event.code, wasClean: event.wasClean });
      sockets.delete(path);

      // Переподключаемся только если соединение было закрыто неожиданно
      if (!event.wasClean) {
        scheduleReconnect(path);
      }
    });

    socket.addEventListener('error', () => {
      console.error(`❌ Ошибка соединения: ${path}`);
    });

    // Обработка системных событий (ready, ping)
    socket.addEventListener('message', event => {
      try {
        const data = JSON.parse(String(event.data || '{}')) as Record<string, unknown>;
        const eventType = data.type || data.event;

        if (eventType === 'ping') {
          // Отвечаем на ping сообщением pong
          const pongMessage = JSON.stringify({ type: 'pong' });

          if (socket.readyState === WebSocket.OPEN) {
            socket.send(pongMessage);
          }
        } else if (eventType === 'ready') {
          console.log(`✅ Соединение готово: ${path}`);
        }
      } catch {
        // Игнорируем ошибки парсинга системных сообщений
      }
    });

    sockets.set(path, socket);
  }

  return sockets.get(path)!;
};

export const closeSocket = (path: string): void => {
  // Отменяем переподключение
  const timer = reconnectTimers.get(path);

  if (timer) {
    clearTimeout(timer);
    reconnectTimers.delete(path);
  }
  reconnectDelays.delete(path);

  const socket = sockets.get(path);

  if (socket) {
    try {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    } catch {
      // Игнорируем ошибки при закрытии
    }
    sockets.delete(path);
  }
};
