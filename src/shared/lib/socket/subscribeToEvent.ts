import { closeSocket, getSocket } from './getSocket';

type Callback<T> = (data: T) => void;

// Отслеживаем количество активных подписок для каждого пути
const subscriptionCounts: Map<string, number> = new Map();

export const subscribeToEvent = <T>(socketPath: string, callback: Callback<T>) => {
  const socket = getSocket(socketPath);

  // Увеличиваем счетчик подписок
  const currentCount = subscriptionCounts.get(socketPath) || 0;

  subscriptionCounts.set(socketPath, currentCount + 1);

  const handleMessage = (event: MessageEvent): void => {
    try {
      const data = JSON.parse(String(event.data || '{}')) as Record<string, unknown> & T;
      const eventType = data.type || data.event;

      // Пропускаем только ping/pong - они обрабатываются на уровне соединения
      // ready и balance передаем в callback для обработки
      if (eventType === 'ping' || eventType === 'pong') {
        return;
      }

      // Передаем только данные события пользовательскому callback
      callback(data);
    } catch (error) {
      console.warn('Failed to parse WebSocket message:', error);
    }
  };

  socket.addEventListener('message', handleMessage);

  return () => {
    socket.removeEventListener('message', handleMessage);

    // Уменьшаем счетчик подписок
    const count = subscriptionCounts.get(socketPath) || 0;

    if (count <= 1) {
      // Если это последняя подписка, закрываем соединение
      subscriptionCounts.delete(socketPath);
      closeSocket(socketPath);
    } else {
      subscriptionCounts.set(socketPath, count - 1);
    }
  };
};
