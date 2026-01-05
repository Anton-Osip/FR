import { closeSocket, getSocket } from './getSocket';

type Callback<T> = (data: T) => void;

// Отслеживаем количество активных подписок для каждого пути
const subscriptionCounts: Map<string, number> = new Map();

export const subscribeToEvent = <T>(socketPath: string, callback: Callback<T>) => {
  const socket = getSocket(socketPath);

  const currentCount = subscriptionCounts.get(socketPath) || 0;

  subscriptionCounts.set(socketPath, currentCount + 1);

  const handleMessage = (event: MessageEvent): void => {
    try {
      const data = JSON.parse(String(event.data || '{}')) as Record<string, unknown> & T;
      const eventType = data.type || data.event;

      if (eventType === 'pong') {
        return;
      }

      callback(data);
    } catch (error) {
      console.warn('Failed to parse WebSocket message:', error);
    }
  };

  socket.addEventListener('message', handleMessage);

  return () => {
    socket.removeEventListener('message', handleMessage);

    const count = subscriptionCounts.get(socketPath) || 0;

    if (count <= 1) {
      subscriptionCounts.delete(socketPath);
      closeSocket(socketPath);
    } else {
      subscriptionCounts.set(socketPath, count - 1);
    }
  };
};
