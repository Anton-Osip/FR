import { useEffect, useState } from 'react';

import { useInitSlotMutation, useInitSlotDemoMutation } from '@features/showcase';

interface UseSlotGameUrlParams {
  gameUuid: string | undefined;
  activeTab: string;
}

interface UseSlotGameUrlReturn {
  gameUrl: string;
  isGameLoading: boolean;
}

export const useSlotGameUrl = ({ gameUuid, activeTab }: UseSlotGameUrlParams): UseSlotGameUrlReturn => {
  const [gameUrl, setGameUrl] = useState<string>('');

  const [initSlot, { isLoading: isInitSlotLoading }] = useInitSlotMutation();
  const [initSlotDemo, { isLoading: isInitSlotDemoLoading }] = useInitSlotDemoMutation();

  useEffect(() => {
    if (!gameUuid) return;

    const initGame = async (): Promise<void> => {
      setGameUrl('');

      try {
        let result;

        if (activeTab === 'demo') {
          result = await initSlotDemo({ game_uuid: gameUuid }).unwrap();
        } else if (activeTab === 'play') {
          result = await initSlot({ game_uuid: gameUuid }).unwrap();
        }

        if (result) {
          setGameUrl(result.url);
        }
      } catch (error) {
        console.error('Failed to initialize slot:', error);
        setGameUrl('');
      }
    };

    void initGame();
  }, [activeTab, gameUuid, initSlot, initSlotDemo]);

  const isGameLoading = isInitSlotLoading || isInitSlotDemoLoading;

  return {
    gameUrl,
    isGameLoading,
  };
};
