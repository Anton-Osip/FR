import {
  type ElementType,
  type ReactNode,
  type RefCallback,
  type TouchEvent,
  WheelEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';

import { ChevronHorizontal, SearchIcon } from '@shared/ui/icons';

import { Input } from '../input';

import s from './DropdownApp.module.scss';
import { DropdownItem } from './DropdownItem';

export type DropdownMenuItems = {
  href?: string;
  icon?: ElementType;
  id: string;
  onClick?: () => void;
  title: string;
};

type Props<T extends DropdownMenuItems> = {
  /** Список элементов для отображения */
  list: T[];
  /** Кастомная функция рендеринга элемента списка */
  renderItem?: (item: T, onSelect: () => void, index?: number) => ReactNode;
  /** Кастомный триггер для открытия дропдауна */
  trigger?: ReactNode;
  /** ID или title выбранного элемента (контролируемый режим) */
  value?: string;
  /** Callback при выборе элемента */
  onChange?: (item: T) => void;
  /** CSS класс для контейнера элементов */
  itemsClassName?: string;
  /** CSS класс для триггера */
  triggerClassName?: string;
  /** Показывать ли поле поиска */
  showSearch?: boolean;
  /** Callback при изменении поискового запроса (для серверного поиска) */
  onSearchChange?: (query: string) => void;
  /** Значение поискового запроса (для контролируемого режима) */
  searchValue?: string;
  /** Контент для отображения при пустом списке */
  emptyContent?: ReactNode;
  /** Элемент-триггер для загрузки дополнительных данных (бесконечная прокрутка) */
  loadMoreTrigger?: ReactNode;
  /** Callback ref для получения ссылки на контейнер контента */
  onContentRef?: RefCallback<HTMLDivElement>;
};

/**
 * Универсальный компонент выпадающего меню с поддержкой поиска и бесконечной прокрутки
 * Поддерживает как клиентский (неконтролируемый), так и серверный (контролируемый) поиск
 */
export const DropdownApp = <T extends DropdownMenuItems>(props: Props<T>): ReactNode => {
  const {
    list,
    renderItem,
    trigger,
    value,
    onChange,
    itemsClassName,
    triggerClassName,
    showSearch,
    onSearchChange,
    searchValue,
    emptyContent,
    loadMoreTrigger,
    onContentRef,
  } = props;
  const [open, setOpen] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number>(0);

  // Callback ref для уведомления родительского компонента об изменении contentRef
  const handleContentRef = useCallback<RefCallback<HTMLDivElement>>(
    ref => {
      contentRef.current = ref;
      onContentRef?.(ref);
    },
    [onContentRef],
  );

  // Определяем режим работы поиска: контролируемый (серверный) или неконтролируемый (клиентский)
  const isControlledSearch = onSearchChange !== undefined;

  // Значение для отображения в поле поиска
  const displaySearchQuery = isControlledSearch ? (searchValue ?? '') : internalSearchQuery;

  const handleSearchChange = (query: string): void => {
    if (isControlledSearch) {
      onSearchChange(query);
    } else {
      setInternalSearchQuery(query);
    }
  };

  const selectedItem = useMemo(() => {
    if (value) {
      return list.find(item => item.id === value || item.title === value);
    }

    return list[0];
  }, [value, list]);

  const [selectedTitle, setSelectedTitle] = useState<string>(
    value ? (selectedItem?.title ?? list[0]?.title ?? 'Выбрано') : (list[0]?.title ?? 'Выбрано'),
  );

  const displayTitle = value ? (selectedItem?.title ?? 'Выбрано') : selectedTitle;

  const handleOpenChange = (openState: boolean): void => {
    setOpen(openState);
    if (!openState) {
      if (isControlledSearch) {
        onSearchChange?.('');
      } else {
        setInternalSearchQuery('');
      }
    }
  };

  // Обработчик взаимодействия вне меню - закрываем dropdown
  const handleInteractOutside = useCallback((event: Event) => {
    // Проверяем, что клик был вне триггера
    const target = event.target as HTMLElement;

    if (!contentRef.current?.contains(target)) {
      setOpen(false);
    }
  }, []);

  // Обработчик скролла колесиком мыши для предотвращения блокировки в модальном окне
  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    const content = contentRef.current;

    if (!content) return;

    const { scrollTop, scrollHeight, clientHeight } = content;
    const isScrollable = scrollHeight > clientHeight;

    if (!isScrollable) return;

    // Предотвращаем всплытие события, если скроллим внутри контента
    const isScrollingDown = e.deltaY > 0;
    const isScrollingUp = e.deltaY < 0;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;

    // Останавливаем всплытие, если можем скроллить в этом направлении
    if ((isScrollingDown && !isAtBottom) || (isScrollingUp && !isAtTop)) {
      e.stopPropagation();
    }
  }, []);

  // Обработчик начала касания для мобильных устройств
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = e.touches[0].clientY;
  }, []);

  // Обработчик движения касания для предотвращения блокировки скролла в модальном окне
  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const content = contentRef.current;

    if (!content) return;

    const { scrollTop, scrollHeight, clientHeight } = content;
    const isScrollable = scrollHeight > clientHeight;

    if (!isScrollable) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchStartYRef.current - touchY;

    // Определяем направление скролла
    const isScrollingDown = deltaY > 0;
    const isScrollingUp = deltaY < 0;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;

    // Останавливаем всплытие, если можем скроллить в этом направлении
    if ((isScrollingDown && !isAtBottom) || (isScrollingUp && !isAtTop)) {
      e.stopPropagation();
    }

    touchStartYRef.current = touchY;
  }, []);

  const triggerRootClassName = clsx(s.trigger, triggerClassName);
  const contentClassName = clsx(s.content, itemsClassName);

  // Фильтрация списка: если поиск контролируемый (серверный), фильтрация не нужна
  // Если поиск неконтролируемый (клиентский), фильтруем по внутреннему состоянию
  const filteredList = useMemo(() => {
    if (!showSearch || isControlledSearch) {
      return list;
    }

    const query = internalSearchQuery.trim();

    if (!query) {
      return list;
    }

    return list.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
  }, [list, internalSearchQuery, showSearch, isControlledSearch]);

  // Мемоизация элементов дропдауна для оптимизации рендеринга
  const dropDownMenuItems = useMemo(() => {
    return filteredList.map((item: T) => {
      const handleSelect = (): void => {
        if (!value) {
          setSelectedTitle(item.title);
        }

        if (onChange) {
          onChange(item);
        }

        if ('onClick' in item && typeof item.onClick === 'function') {
          item.onClick();
        } else if ('href' in item && typeof item.href === 'string') {
          window.location.href = item.href;
        }

        setOpen(false);
      };

      return (
        <DropdownMenu.Item className={s.dropdownMenuItem} key={item.id ?? item.title} onSelect={handleSelect}>
          {renderItem ? (
            renderItem(item, handleSelect)
          ) : (
            <DropdownItem
              className={s.dropdownItem}
              title={item.title}
              onSelect={handleSelect}
              active={value ? item.id === value || item.title === value : displayTitle === item.title}
            />
          )}
        </DropdownMenu.Item>
      );
    });
  }, [filteredList, value, onChange, renderItem, displayTitle]);

  return (
    <DropdownMenu.Root open={open} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenu.Trigger asChild className={triggerRootClassName}>
        {trigger ?? (
          <button type="button" aria-haspopup="listbox" aria-expanded={open}>
            <span className={s.label}>{displayTitle}</span>
            <span className={clsx(s.chevron, open && s.chevronOpen)} aria-hidden="true">
              <ChevronHorizontal />
            </span>
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          ref={handleContentRef}
          align={'center'}
          className={contentClassName}
          side="bottom"
          sideOffset={5}
          avoidCollisions={false}
          data-radix-scroll-lock-ignore="true"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onInteractOutside={handleInteractOutside}
          onEscapeKeyDown={() => setOpen(false)}
          style={{
            minWidth: 'var(--radix-dropdown-menu-trigger-width)',
            width: 'var(--radix-dropdown-menu-trigger-width)',
          }}
        >
          {showSearch && (
            <div className={s.searchContainer}>
              <Input
                value={displaySearchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Поиск..."
                icon={<SearchIcon />}
                iconPosition="start"
                size="s"
                className={s.searchInput}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          )}
          {filteredList.length === 0 && emptyContent ? (
            <div className={s.emptyContent}>{emptyContent}</div>
          ) : (
            <>
              {dropDownMenuItems}
              {loadMoreTrigger}
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
