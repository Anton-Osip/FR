import { FC, useMemo } from 'react';

import clsx from 'clsx';

import { Button } from '@shared/ui';

import styles from './AmountSteps.module.scss';

interface AmountStepsProps {
  minAmount?: number;
  maxAmount?: number;
  buttonCount?: number;
  customSteps?: string[];
  currencySymbol: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DEFAULT_BUTTON_COUNT = 5;

// Константы для мультипликативной шкалы маленьких чисел
// eslint-disable-next-line no-magic-numbers
const SMALL_NUMBER_MULTIPLIERS = [1, 2, 5, 10, 20, 50, 100] as const;

// Пороговые значения для округления
const ROUNDING_THRESHOLD = {
  THOUSAND: 1000,
  HUNDRED: 100,
  TEN: 10,
} as const;

// Делители для округления
const ROUNDING_DIVISOR = {
  HUNDRED: 100,
  TEN: 10,
} as const;

export const AmountSteps: FC<AmountStepsProps> = ({
  minAmount = 0,
  maxAmount,
  buttonCount = DEFAULT_BUTTON_COUNT,
  customSteps,
  currencySymbol,
  value,
  onChange,
  className,
}) => {
  const steps = useMemo(() => {
    if (customSteps?.length) {
      return customSteps.map((val, index) => ({
        id: String(index + 1),
        value: val,
      }));
    }

    // Определяем количество знаков после запятой на основе minAmount
    const decimals = (minAmount.toString().split('.')[1] || '').length;

    // Функция для форматирования числа с удалением лишних нулей
    const formatValue = (num: number): string => {
      if (decimals === 0 && Number.isInteger(num)) {
        return String(Math.round(num));
      }

      // Сначала форматируем с нужным количеством знаков
      const formatted = num.toFixed(decimals);

      // Удаляем лишние нули в конце
      return formatted.replace(/\.?0+$/, '');
    };

    // Для маленьких чисел используем мультипликативную шкалу
    if (minAmount < 1) {
      return Array.from({ length: buttonCount }, (_, index) => {
        // Первый шаг - всегда minAmount
        if (index === 0) {
          return {
            id: String(index + 1),
            value: formatValue(minAmount),
          };
        }

        // Используем множители для прогрессивного увеличения
        const multiplierIndex = Math.min(index, SMALL_NUMBER_MULTIPLIERS.length - 1);
        const multiplier = SMALL_NUMBER_MULTIPLIERS[multiplierIndex];
        let stepValue = minAmount * multiplier;

        // Если задан maxAmount, не превышаем его
        if (maxAmount !== undefined) {
          stepValue = Math.min(stepValue, maxAmount);
        }

        return {
          id: String(index + 1),
          value: formatValue(stepValue),
        };
      });
    }

    // Для обычных чисел
    return Array.from({ length: buttonCount }, (_, index) => {
      // Первый шаг - всегда minAmount
      if (index === 0) {
        return {
          id: String(index + 1),
          value: formatValue(minAmount),
        };
      }

      // Прогрессивное увеличение: ×2, ×3, ×4 и т.д.
      const multiplier = index + 1;
      let stepValue = minAmount * multiplier;

      // Если задан maxAmount, не превышаем его
      if (maxAmount !== undefined) {
        stepValue = Math.min(stepValue, maxAmount);
      } else {
        // Если max не задан, используем красивое округление
        if (stepValue > ROUNDING_THRESHOLD.THOUSAND) {
          stepValue = Math.round(stepValue / ROUNDING_DIVISOR.HUNDRED) * ROUNDING_DIVISOR.HUNDRED;
        } else if (stepValue > ROUNDING_THRESHOLD.HUNDRED) {
          stepValue = Math.round(stepValue / ROUNDING_DIVISOR.TEN) * ROUNDING_DIVISOR.TEN;
        } else if (stepValue > ROUNDING_THRESHOLD.TEN) {
          stepValue = Math.round(stepValue);
        }
      }

      return {
        id: String(index + 1),
        value: formatValue(stepValue),
      };
    });
  }, [minAmount, maxAmount, buttonCount, customSteps]);

  // Удаляем дубликаты, если они появились из-за ограничения maxAmount
  const uniqueSteps = steps.filter((step, index, self) => index === self.findIndex(s => s.value === step.value));

  return (
    <div className={clsx(styles.steps, className)}>
      {uniqueSteps.map(step => (
        <Button
          variant={'tertiary'}
          key={step.id}
          active={step.value === value}
          onClick={() => onChange(step.value)}
          className={styles.stepsBtn}
        >
          {step.value} {currencySymbol}
        </Button>
      ))}
    </div>
  );
};
