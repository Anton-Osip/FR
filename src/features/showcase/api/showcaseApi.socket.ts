import type { Bet } from '@/entities/bet';
import { subscribeToEvent } from '@/shared/lib';

type BettingTableMessage =
  | {
      type?: string;
      event?: string;
      data?: Bet;
    }
  | Bet;

interface SetupBettingTableWebSocketParams {
  socketPath: string;
  expectedEventType: string;
  pageSize: number;
  updateCachedData: (updateFn: (state: { items: Bet[] }) => void) => void;
}

/**
 * Парсит WebSocket сообщение и извлекает Bet объект
 */
function parseBettingTableMessage(msg: BettingTableMessage): Bet | null {
  if ('data' in msg && msg.data) {
    return msg.data as Bet;
  }

  if (typeof msg === 'object' && msg !== null && 'user_name' in msg && 'avatar_url' in msg && 'game_title' in msg) {
    return msg as Bet;
  }

  return null;
}

/**
 * Настраивает WebSocket подписку для betting table endpoints
 * Автоматически обрабатывает разные форматы сообщений и управляет кешем
 */
export function setupBettingTableWebSocket({
  socketPath,
  expectedEventType,
  pageSize,
  updateCachedData,
}: SetupBettingTableWebSocketParams): () => void {
  return subscribeToEvent<BettingTableMessage>(socketPath, msg => {
    const isEventObject = typeof msg === 'object' && msg !== null && ('type' in msg || 'event' in msg || 'data' in msg);

    if (isEventObject) {
      const eventType =
        (msg as { type?: string; event?: string }).type || (msg as { type?: string; event?: string }).event;

      if (eventType && eventType !== expectedEventType) {
        return;
      }
    }

    const newBet = parseBettingTableMessage(msg);

    if (newBet) {
      updateCachedData(state => {
        state.items.unshift(newBet);
        if (state.items.length > pageSize) {
          state.items.splice(pageSize);
        }
      });
    }
  });
}
