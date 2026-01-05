import type { Bet } from '@/entities/bet';
import { subscribeToEvent } from '@/shared/lib/socket';

type BettingTableMessage =
  | {
      payload?: {
        data: Bet;
      };
      type?: string;
    }
  | Bet;

interface SetupBettingTableWebSocketParams {
  socketPath: string;
  pageSize: number;
  updateCachedData: (updateFn: (state: { items: Bet[] }) => void) => void;
}

/**
 * Парсит WebSocket сообщение и извлекает Bet объект
 */
function parseBettingTableMessage(msg: BettingTableMessage): Bet | null {
  // Формат 1: { payload: { data: Bet } }
  if ('payload' in msg && msg.payload?.data) {
    return msg.payload.data as Bet;
  }

  // Формат 2: прямой Bet объект
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
  pageSize,
  updateCachedData,
}: SetupBettingTableWebSocketParams): () => void {
  return subscribeToEvent<BettingTableMessage>(socketPath, msg => {
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
