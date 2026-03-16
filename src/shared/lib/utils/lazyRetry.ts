import { type ComponentType, lazy, type LazyExoticComponent } from 'react';

/**
 * Обертка для React.lazy с обработкой ошибок загрузки chunk.
 * При ошибке "Failed to fetch" или других ошибках загрузки модуля
 * автоматически перезагружает страницу.
 *
 * @param componentImport - Функция импорта компонента
 * @returns Lazy-загруженный компонент
 */
export const lazyRetry = <T extends ComponentType<Record<string, never>>>(
  componentImport: () => Promise<{ default: T }>,
): LazyExoticComponent<T> => {
  return lazy(
    () =>
      new Promise<{ default: T }>((resolve, reject) => {
        componentImport()
          .then(resolve)
          .catch(error => {
            const errorMessage = error?.message || String(error);

            // Проверяем на ошибки загрузки chunk
            if (
              errorMessage.includes('Failed to fetch') ||
              errorMessage.includes('Loading chunk') ||
              errorMessage.includes('error loading dynamically imported module') ||
              errorMessage.includes('MIME type') ||
              errorMessage.includes('was blocked due to an unresolved MIME-type')
            ) {
              // Перезагружаем страницу при ошибке загрузки chunk
              // Не вызываем reject, так как страница перезагрузится
              window.location.reload();

              return;
            }

            // Для других ошибок пробрасываем дальше
            reject(error);
          });
      }),
  );
};
