import { type ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

import { Toaster, type ToasterProps } from './Toaster';

/**
 * Toaster с порталом для рендеринга на самом верхнем уровне DOM
 * Это гарантирует, что toast всегда будет поверх модалок
 */
export const ToasterPortal = (props: ToasterProps): ReactElement | null => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Создаем контейнер если его нет
    let container = document.getElementById('toaster-root');

    if (!container) {
      container = document.createElement('div');
      container.id = 'toaster-root';
      document.body.appendChild(container);
    }
  }, []);

  if (!mounted) return null;

  const container = document.getElementById('toaster-root');

  if (!container) return null;

  return createPortal(<Toaster {...props} />, container);
};
