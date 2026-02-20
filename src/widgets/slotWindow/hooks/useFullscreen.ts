import { RefObject, useCallback, useEffect, useState } from 'react';

interface UseFullscreenReturn {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const useFullscreen = (elementRef: RefObject<HTMLElement | null>): UseFullscreenReturn => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = useCallback((): void => {
    const element = elementRef.current;

    if (!element) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen();
    }
  }, [elementRef]);

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return { isFullscreen, toggleFullscreen };
};
