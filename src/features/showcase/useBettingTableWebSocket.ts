import { useEffect, useRef } from 'react';

import { showcaseApi } from './showcaseApi';

import { useAppDispatch } from '@/shared/api';
import { BFF } from '@/shared/config';
import type { BettingTableBetItem } from '@/shared/schemas';

type TabValue = 'lastBets' | 'myBets' | 'bigPlayers';

interface UseBettingTableWebSocketParams {
  activeTab: TabValue;
  pageSize: number;
}

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

export function useBettingTableWebSocket({ activeTab, pageSize }: UseBettingTableWebSocketParams): void {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef<number>(RECONNECT_BASE_DELAY_MS);
  const stoppedRef = useRef<boolean>(false);

  useEffect(() => {
    stoppedRef.current = false;

    const getWebSocketPath = (): string | null => {
      switch (activeTab) {
        case 'lastBets':
          return '/api/v1/showcase/betting_table/ws/latest';
        case 'myBets':
          return '/api/v1/showcase/betting_table/ws/my';
        case 'bigPlayers':
          return '/api/v1/showcase/betting_table/ws/big-wins';
        default:
          return null;
      }
    };

    const path = getWebSocketPath();

    if (!path) {
      return;
    }

    const url = getWebSocketUrl(path);

    const updateCache = (newItem: BettingTableBetItem): void => {
      try {
        const params = { page_size: pageSize };

        switch (activeTab) {
          case 'lastBets':
            dispatch(
              showcaseApi.util.updateQueryData('getBettingTableBetsLatest', params, draft => {
                draft.items.unshift(newItem);

                if (draft.items.length > pageSize) {
                  draft.items.splice(pageSize);
                }
              }),
            );
            break;
          case 'myBets':
            dispatch(
              showcaseApi.util.updateQueryData('getBettingTableBetsMy', params, draft => {
                draft.items.unshift(newItem);
                if (draft.items.length > pageSize) {
                  draft.items.splice(pageSize);
                }
              }),
            );
            break;
          case 'bigPlayers':
            dispatch(
              showcaseApi.util.updateQueryData('getBettingTableBetsBigWins', params, draft => {
                draft.items.unshift(newItem);
                if (draft.items.length > pageSize) {
                  draft.items.splice(pageSize);
                }
              }),
            );
            break;
        }
      } catch (error) {
        console.warn('Failed to update cache:', error);
      }
    };

    const handleMessage = (ev: MessageEvent): void => {
      try {
        const data = JSON.parse(String(ev.data || '{}')) as unknown;

        let betItem: BettingTableBetItem | null = null;

        if (data && typeof data === 'object') {
          const parsed = data as Record<string, unknown>;

          if (
            typeof parsed.user_name === 'string' &&
            typeof parsed.avatar_url === 'string' &&
            typeof parsed.game_title === 'string' &&
            typeof parsed.game_image_url === 'string' &&
            typeof parsed.stake === 'number' &&
            typeof parsed.payout === 'number' &&
            typeof parsed.multiplier === 'number'
          ) {
            betItem = parsed as unknown as BettingTableBetItem;
          } else if (parsed.data && typeof parsed.data === 'object') {
            const dataField = parsed.data as Record<string, unknown>;

            if (
              typeof dataField.user_name === 'string' &&
              typeof dataField.avatar_url === 'string' &&
              typeof dataField.game_title === 'string' &&
              typeof dataField.game_image_url === 'string' &&
              typeof dataField.stake === 'number' &&
              typeof dataField.payout === 'number' &&
              typeof dataField.multiplier === 'number'
            ) {
              betItem = dataField as unknown as BettingTableBetItem;
            }
          }
        }

        if (betItem) {
          updateCache(betItem);
        }
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    };

    const cleanupWs = (): void => {
      if (!wsRef.current) return;

      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
      } catch {
        /* empty */
      }

      try {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      } catch {
        /* empty */
      }

      wsRef.current = null;
    };

    const scheduleReconnect = (reason: string): void => {
      if (stoppedRef.current) return;
      if (reconnectTimerRef.current) return;

      const delay = reconnectDelayRef.current;

      reconnectDelayRef.current = Math.min(
        Math.floor(reconnectDelayRef.current * RECONNECT_EXPONENT),
        RECONNECT_MAX_DELAY_MS,
      );

      console.debug(`[WebSocket] Reconnect scheduled: ${reason}, delay: ${delay}ms`);

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect('reconnect');
      }, delay);
    };

    const connect = (reason: string): void => {
      cleanupWs();

      if (stoppedRef.current) return;

      try {
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
          reconnectDelayRef.current = RECONNECT_BASE_DELAY_MS;
          console.debug(`[WebSocket] Connected: ${reason}`, { url, activeTab });
        };

        wsRef.current.onmessage = handleMessage;

        wsRef.current.onerror = error => {
          console.warn('[WebSocket] Error:', error);
        };

        wsRef.current.onclose = (ev: CloseEvent) => {
          console.debug('[WebSocket] Closed:', {
            code: ev.code,
            reason: ev.reason,
            wasClean: ev.wasClean,
            activeTab,
          });

          if (!ev.wasClean && !stoppedRef.current) {
            scheduleReconnect('close');
          }
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);

        console.error('[WebSocket] Connect error:', msg);
        scheduleReconnect('connect_error');
      }
    };

    connect('init');

    return () => {
      stoppedRef.current = true;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      cleanupWs();
      reconnectDelayRef.current = RECONNECT_BASE_DELAY_MS;
    };
  }, [activeTab, pageSize, dispatch]);
}
