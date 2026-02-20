import { RefObject, useEffect } from 'react';

import { selectIsFullscreen, setFullscreen } from '@app/store';

import { useAppDispatch, useAppSelector } from '@shared/api';

interface UseFullscreenReduxReturn {
  isFullscreen: boolean;
  setFullscreenMode: (value: boolean) => void;
}

/**
 * Хук для управления полноэкранным режимом через Redux состояние
 * @param elementRef - ссылка на элемент, который нужно перевести в fullscreen
 * @returns объект с состоянием fullscreen и функцией для его изменения
 */
export const useFullscreenRedux = (elementRef: RefObject<HTMLElement | null>): UseFullscreenReduxReturn => {
  const dispatch = useAppDispatch();
  const isFullscreen = useAppSelector(selectIsFullscreen);

  // Запрос fullscreen при изменении состояния
  useEffect(() => {
    if (!isFullscreen || !elementRef.current) return;
    if (document.fullscreenElement === elementRef.current) return;

    const element = elementRef.current;
    const requestFn =
      element.requestFullscreen ??
      (element as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen;

    if (requestFn) {
      requestFn.call(element).catch(() => dispatch(setFullscreen({ isFullscreen: false })));
    } else {
      dispatch(setFullscreen({ isFullscreen: false }));
    }
  }, [isFullscreen, elementRef, dispatch]);

  // Отслеживание изменения fullscreen состояния браузера
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      if (!document.fullscreenElement) {
        dispatch(setFullscreen({ isFullscreen: false }));
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [dispatch]);

  const setFullscreenMode = (value: boolean): void => {
    dispatch(setFullscreen({ isFullscreen: value }));
  };

  return { isFullscreen, setFullscreenMode };
};
